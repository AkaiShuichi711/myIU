# myIU Portal — Architecture & System Design

---

## 1. System Context (C4 Level 1)

```
┌────────────────────────────────────────────────────────────────────┐
│                          myIU System                               │
│                                                                    │
│  ┌────────────────┐   ┌────────────────┐   ┌──────────────────┐   │
│  │  Student /     │   │     Admin      │   │  Microsoft 365   │   │
│  │  Lecturer      │   │   (IU staff)   │   │   (Azure AD)     │   │
│  └───────┬────────┘   └───────┬────────┘   └────────┬─────────┘   │
│          │                    │                     │              │
│          ▼                    ▼                     │              │
│  ┌──────────────────────────────────────┐            │              │
│  │  myIU Portal  :5173 / :8080          │◄───────────┘              │
│  │  (students + lecturers + /admin)     │  OAuth2 callback          │
│  └──────────────────────────────────────┘                          │
│          │                                                         │
│          ▼                                                         │
│  ┌────────────────┐    ┌────────────────────┐                     │
│  │  PostgreSQL 16 │    │  ip-api.com (ext)  │                     │
│  │  myiu_{env}    │    │  GeoIP lookup      │                     │
│  └────────────────┘    └────────────────────┘                     │
│                                                                    │
│                         ┌────────────────────┐                    │
│                         │  Gmail SMTP (ext)  │                    │
│                         │  form notifications │                    │
│                         └────────────────────┘                    │
└────────────────────────────────────────────────────────────────────┘
```

> Note: The admin panel (`/admin/*`) is embedded inside the portal frontend. There is no separate admin application — it shares the same backend and database.

---

## 2. Three-Environment Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  DEVELOPER WORKSTATION  (SPRING_PROFILES_ACTIVE=local)               │
│                                                                      │
│  Backend runs on host (hot reload)    PostgreSQL in Docker           │
│  :8080 portal-backend            →   myiu_local                     │
│  :5173 portal-frontend (Vite)        (safe to wipe anytime)         │
└──────────────────────────────────────────────────────────────────────┘
                          │ git push develop
                          ▼ GitHub Actions: deploy-dev.yml
┌──────────────────────────────────────────────────────────────────────┐
│  DEV SERVER  (SPRING_PROFILES_ACTIVE=dev)                            │
│                                                                      │
│  All services in Docker containers                                   │
│  portal-backend  → myiu_dev                                          │
│  portal-frontend, postgres                                           │
└──────────────────────────────────────────────────────────────────────┘
                          │ git tag v1.x.x
                          ▼ GitHub Actions: deploy-prod.yml
┌──────────────────────────────────────────────────────────────────────┐
│  PRODUCTION  (SPRING_PROFILES_ACTIVE=prod)                           │
│                                                                      │
│  DB: myiu_prod  |  Swagger: DISABLED  |  Logging: WARN only         │
│  No secret fallbacks — app refuses to start if env var missing      │
└──────────────────────────────────────────────────────────────────────┘
```

### Profile → File mapping

| Profile | Config file | DB | JWT fallback | Swagger |
|---|---|---|---|---|
| `local` | `application-local.yml` | `myiu_local` | Yes (dev only) | ✓ |
| `dev` | `application-dev.yml` | `myiu_dev` | No — fail-fast | ✓ |
| `prod` | `application-prod.yml` | `myiu_prod` | No — fail-fast | ✗ |
| `test` | `application-test.yml` | Testcontainers | Yes (test only) | ✗ |

---

## 3. Security Filter Chain

```
HTTP Request
     │
     ▼
① RateLimitFilter  (Order 1)
     │  Token-bucket O(1): check (IP + endpoint) bucket
     │  Bucket empty? → 429 Too Many Requests + Retry-After header
     │
     ▼
② CorsFilter  (Spring Security)
     │  Check Origin against allowed-origins from active profile
     │
     ▼
③ JwtAuthenticationFilter
     │  1. Extract "Bearer <token>" from Authorization header
     │  2. JwtService.extractUsername(token) → email
     │  3. JwtService.extractSessionId(token) → UUID
     │  4. loginSessionRepository.existsByIdAndRevokedFalse(sessionId)
     │       FALSE → return 401 {"message":"Session has been revoked"}
     │  5. UserDetailsServiceImpl.loadByUsername(email)
     │  6. Set SecurityContextHolder authentication
     │  7. request.setAttribute("sessionId", sessionId)
     │
     ▼
④ SecurityConfig.authorizeHttpRequests
     │  /api/auth/**     → permitAll
     │  /oauth2/**       → permitAll
     │  /ws/**           → permitAll (WebSocket upgrade; JWT validated in STOMP interceptor)
     │  /actuator/**     → authenticated
     │  everything else  → authenticated
     │
     ▼
Controller → @PreAuthorize("hasRole('...')") → Service → Repository → PostgreSQL
```

---

## 4. Login Flow with Async GeoIP

```
User clicks "Sign in with Microsoft"
     │
     ▼
OAuth2SuccessHandler.onAuthenticationSuccess()
     │
     ├─ 1. Validate user (is in DB + is_active)
     │
     ├─ 2. sessionService.createSession(user, request)
     │       ├─ Extract IP from X-Forwarded-For / X-Real-IP / getRemoteAddr()
     │       ├─ Parse User-Agent → browser, OS, device type
     │       ├─ Save LoginSession to DB with country="Resolving"  ← FAST (< 5ms)
     │       └─ geoIpService.lookupAndEnrich(ip, sessionId)      ← ASYNC (geoIpExecutor)
     │
     ├─ 3. jwtService.generateToken(email, {"sessionId": session.getId()})
     │
     └─ 4. Redirect → /auth/callback?token=<jwt>

Login latency: < 50ms (no GeoIP wait)
```

---

## 5. Email Notification Flow

```
Admin approves/rejects a FormSubmission
     │
     ▼
FormController.updateSubmission()
     │  formSubmissionRepository.save(submission)
     │
     ├─ status == "approved" → emailService.sendFormApproved(toEmail, name, title, id)
     └─ status == "rejected" → emailService.sendFormRejected(toEmail, name, title, reason, id)

EmailService (@Async("emailExecutor") — 1-2 thread pool)
     │  fromAddress blank? → log warning, return (graceful no-op)
     │
     └─ MimeMessageHelper (UTF-8, HTML=true)
           → table-based HTML email
           → navy header (#003087), green/red status badge
           → CTA button → ${FRONTEND_URL}/forms
           → Gmail SMTP:587 (STARTTLS)
```

---

## 6. WebSocket / Real-time Notifications

```
Frontend (useNotificationSocket hook)
     │  SockJS → GET /ws (HTTP upgrade to WebSocket)
     │
     ▼
WebSocketAuthInterceptor (ChannelInterceptor)
     │  STOMP CONNECT frame → extract JWT from "Authorization" header
     │  Validate JWT → set Principal
     │
     ▼
STOMP Broker (in-memory SimpleBroker)
     │
     └─ /topic/notifications/{userId}
           ← NotificationService.push() sends here
           → Frontend receives, updates bell badge + notification list
```

---

## 7. Assignment Submission Flow

```
Student submits assignment
     │
     ▼
AssignmentSubmissionController.submit()
     │  Look up CoursePost (assignment post)
     │  existingSubmission = findByCoursePostIdAndStudentId (upsert pattern)
     │  If already GRADED → reject (cannot resubmit graded work)
     │  Instant.now() > post.getDueDate() → status = LATE, else SUBMITTED
     │
     └─ Save AssignmentSubmission

Lecturer grades submission
     │
     ▼
AssignmentSubmissionController.grade()
     │  Set score (BigDecimal, 5,2), feedback text
     └─ status = GRADED
```

Unique constraint: `(course_post_id, student_id)` — one submission per student per assignment.

---

## 8. Attendance Flow

```
Lecturer opens Attendance tab for CourseDetail
     │
     ▼
AttendanceTab component (frontend)
     │  Lecturer picks date → loads course members (useGetAllCourseMembers)
     │  Loads existing attendance records for that date (useGetAttendance)
     │  Renders P/L/A/E toggle buttons per student
     │
     └─ "Save All" → POST /api/attendance/bulk
           AttendanceController.bulkUpsert()
                 Unique constraint: (course_id, student_id, date) → upsert pattern

Student opens Attendance tab
     │
     └─ GET /api/attendance/mine?courseId= → personal history table
```

Attendance statuses: `PRESENT` | `ABSENT` | `LATE` | `EXCUSED`

---

## 9. Container Diagram (C4 Level 2)

```
┌───────────────────────────────────────────────────────────────────┐
│  Portal Frontend  (React 18 + Vite + TypeScript)                  │
│                                                                   │
│  AuthContext → JWT in localStorage                                │
│  AdminAuthContext → Admin JWT in localStorage                     │
│  React Query v5 → staleTime 5min, invalidateQueries on mutation  │
│  useNotificationSocket → WebSocket STOMP (SockJS)                │
│  i18next → VI/EN translations + Google Translate widget          │
│  401 received → clearToken() → /sign-in?reason=session_expired   │
│                                                                   │
│  Routes:                                                          │
│    /              → student/lecturer app (RootLayout)            │
│    /admin         → admin panel (AdminLayout, JWT-protected)     │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │ HTTPS + JWT Bearer
                                  │ WebSocket (SockJS/STOMP)
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│  Portal Backend  (Spring Boot 3.4.1 · Java 21 · :8080)           │
│                                                                   │
│  Filter chain: RateLimit → CORS → JWT → Authorization            │
│  Virtual Threads: spring.threads.virtual.enabled=true            │
│                                                                   │
│  Controllers (19):                                                │
│    Auth · User · Course · CourseGroup · Post                     │
│    Comment · Block · CoursePost · Grade · GroupMember            │
│    AssignmentSubmission · Attendance                             │
│    Form · Timetable · Notification · Storage · Support · Session │
│    Admin (stats · users · tickets · provision)                   │
│                                                                   │
│  Thread pools:                                                    │
│    geoIpExecutor  — 2-4 threads, async GeoIP HTTP calls         │
│    emailExecutor  — 1-2 threads, async Gmail SMTP sends         │
│                                                                   │
│  WebSocket broker — /ws endpoint, /topic/notifications/{id}      │
│                                                                   │
│  Metrics: /actuator/prometheus → Prometheus → Grafana            │
└────────────────┬──────────────────────────────────────────────────┘
                 │ JPA / Flyway
                 ▼
┌───────────────────────────────────────────────────────────────────┐
│  PostgreSQL 16  (myiu_{local|dev|prod})                           │
│                                                                   │
│  Flyway migrations owned by portal backend:                       │
│  V1: users, posts, courses, forms, notifications, grades          │
│  V2: admin_users                                                  │
│  V3: user_provisioning audit tables                               │
│  V4: support_tickets                                              │
│  V5: login_sessions                                               │
│  V6: course_schedules                                             │
│  V7: assignment_submissions                                       │
│  V8: attendance_records                                           │
└───────────────────────────────────────────────────────────────────┘
```

---

## 10. Database Schema (ER Diagram)

```
users                        login_sessions
──────────────────────       ────────────────────────────
id (PK, UUID)                id (PK, UUID)
name                         user_id (FK → users)
email (UNIQUE)               ip_address
is_active                    country, city, country_code
ms_tenant_id                 browser, browser_version
created_at                   os, device_type
                             raw_user_agent
  │                          is_revoked
  ├──────────────────┐        last_active, created_at
  │                  ▼
user_roles        courses
──────────         ──────────────────────────────
user_id (FK)       id (PK)
role               name, code, semester
                   creator_id (FK → users)
                   is_active
                       │
                       ├─ course_enrollments
                       ├─ course_groups ──── group_members
                       ├─ course_posts  ──── course_post_attachments
                       │     │ (assignment posts)
                       │     └── assignment_submissions        ← V7
                       │           id (PK), course_post_id (FK)
                       │           student_id, student_name
                       │           file_url, file_id, file_name
                       │           text_content, status (SUBMITTED/LATE/GRADED)
                       │           score, feedback
                       │           submitted_at, updated_at
                       │           UNIQUE(course_post_id, student_id)
                       │
                       ├─ course_grades
                       ├─ course_schedules                     ← V6
                       └── attendance_records                  ← V8
                             id (PK), course_id (FK)
                             student_id, student_name
                             date (LocalDate)
                             status (PRESENT/ABSENT/LATE/EXCUSED)
                             note, marked_by, created_at
                             UNIQUE(course_id, student_id, date)

posts                  form_templates ──── form_submissions
──────────────         support_tickets     (submitter_email → email notification)
id (PK)                notifications
creator_id (FK)        blocks · saves · stored_files
  │
  ├── post_media
  ├── saves
  └── comments

admin_users (separate table — email/password auth, different JWT secret)
```

---

## 11. Async Thread Pools

| Pool | Bean name | Core | Max | Queue | Purpose |
|---|---|---|---|---|---|
| geoIpExecutor | `geoIpExecutor` | 2 | 4 | 100 | Async GeoIP HTTP to ip-api.com |
| emailExecutor | `emailExecutor` | 1 | 2 | 50 | Async SMTP email sending |
| Virtual threads | (all other) | — | — | — | Java 21 Project Loom for I/O-bound work |

---

## 12. Algorithms & Data Structures Used

### Token-bucket rate limiting (Bucket4j)

Each (IP + endpoint) key → Bucket stored in Caffeine cache.
`bucket.tryConsumeAndReturnRemaining(1)` — Atomic CAS, O(1) time/space, no lock contention.

### Cursor-based pagination (CursorPage<T>)

`SELECT * FROM posts WHERE id < :cursor ORDER BY id LIMIT 20` — O(log N) B-tree seek vs O(N) OFFSET scan.
`CursorPage.encodeCursor()` → opaque base64 token.

### Upsert pattern (Submissions + Attendance)

Find by unique constraint → if exists, update; if not, create. Enforced at both app and DB level.
- Assignment: `findByCoursePostIdAndStudentId(coursePostId, studentId)`
- Attendance: `findByCourseIdAndStudentIdAndDate(courseId, studentId, date)`

### W-TinyLFU eviction (Caffeine)

Count-Min Sketch O(1) frequency estimation → better hit ratio than LRU for hot data.
Rate limit buckets live in this cache → hot IPs stay in memory.

### Virtual threads (Java 21 Project Loom)

`spring.threads.virtual.enabled=true` — M virtual threads mapped to N OS threads.
Blocking on I/O parks the virtual thread, OS thread is reused.
10,000 concurrent virtual threads ≈ same overhead as 100 OS threads.

---

## 13. CI/CD Pipeline

```
Developer workstation
    │ git push → PR to develop
    ▼
GitHub Actions: ci.yml
    ├── lint-frontend (tsc --noEmit)
    ├── test-portal (mvnw test, Testcontainers)
    └── build-check (docker build — no push)

    │ PR merged → push to develop
    ▼
GitHub Actions: deploy-dev.yml
    ├── docker build + push → ghcr.io/org/myiu-*:dev-{sha}
    └── SSH deploy → docker compose pull && up -d

    │ git tag v1.x.x
    ▼
GitHub Actions: deploy-prod.yml (requires "prod" environment approval)
    ├── docker build + push → ghcr.io/org/myiu-*:v1.x.x + :latest
    └── SSH deploy → docker compose pull && up -d
```

---

## 14. Non-Functional Requirements

| # | Category | Requirement | How |
|---|---|---|---|
| NF1 | Security | JWT revocation takes effect immediately | Per-request DB check in JwtAuthenticationFilter |
| NF2 | Security | No hardcoded secrets in dev/prod | application-dev/prod.yml have zero fallbacks |
| NF3 | Security | Brute-force login protection | Rate limiting: 5 attempts/min/IP |
| NF4 | Security | Non-root container processes | Dockerfile: adduser appuser |
| NF5 | Security | Session tracking + remote logout | login_sessions table + revocation |
| NF6 | Security | WebSocket authentication | WebSocketAuthInterceptor validates JWT on STOMP CONNECT |
| NF7 | Security | Role-based access per endpoint | `@PreAuthorize("hasRole('...')")` on controllers |
| NF8 | Performance | Login < 50ms despite GeoIP | Async GeoIP enrichment on dedicated thread pool |
| NF9 | Performance | High concurrency with low thread overhead | Java 21 virtual threads |
| NF10 | Performance | Fast pagination at scale | Cursor-based pagination (O(log N)) |
| NF11 | Performance | Email sending doesn't block HTTP response | @Async emailExecutor thread pool |
| NF12 | Reliability | Email degrades gracefully when unconfigured | EmailService checks fromAddress blank → log + return |
| NF13 | Reliability | One submission per student per assignment | DB unique constraint (course_post_id, student_id) |
| NF14 | Reliability | One attendance record per student per day | DB unique constraint (course_id, student_id, date) |
| NF15 | Scalability | Schema changes tracked | Flyway V1–V8 versioned migrations |
| NF16 | Observability | Metrics, health, alerting | Actuator + Prometheus + Grafana |
| NF17 | Maintainability | API self-documenting | SpringDoc OpenAPI / Swagger UI |
| NF18 | UX | Real-time notifications | WebSocket STOMP push to `/topic/notifications/{userId}` |

---

## 15. Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth for users | Microsoft 365 only | All IU staff/students have Microsoft accounts |
| Session tracking | JWT + DB revocation check | Stateless JWT + real-time revocation |
| GeoIP | Async enrichment | 3s external HTTP call must not block login |
| Email | Async SMTP (Gmail free tier) | No extra cost; degrades gracefully if unconfigured |
| WebSocket | STOMP over SockJS | Browser-compatible; SockJS fallback for non-WS networks |
| Rate limiting | In-process Caffeine (no Redis) | O(1), sufficient for single-node deployment |
| Pagination | Cursor-based | OFFSET is O(N) scan — unusable at 100k+ rows |
| Schema ownership | Portal Flyway only | One source of truth; admin reads, never writes DDL |
| i18n | i18next + Google Translate widget | i18next for static UI strings; Translate widget for user content |
| Virtual threads | `spring.threads.virtual.enabled=true` | Free performance improvement for I/O-bound workload |
| Admin panel | Embedded in portal frontend | Reduces deployment complexity; admin is low-traffic |
| Assignment upsert | unique constraint + find-then-save | Prevents duplicate submissions at DB level |
| Attendance upsert | unique constraint + find-then-save | Idempotent attendance marking; safe to re-submit |
