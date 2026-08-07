# myIU Portal

University portal for IU (International University).
Students and lecturers sign in via **Microsoft 365 SSO**.
Role-based access enforced at API and UI level.

---

## Architecture overview

```
myIU/ (this repo)                myIU-admin/ (separate repo)
├── backend  :8080  ──────────── shared PostgreSQL ──── backend  :8081
└── frontend :5173                                       frontend :3000
```

| Role | Application | Auth method |
|---|---|---|
| `student` | myIU portal (5173 / 8080) | Microsoft SSO → JWT |
| `lecturer` | myIU portal (5173 / 8080) | Microsoft SSO → JWT |
| `admin` | myIU admin panel (built-in `/admin`) | Email + password → JWT |

---

## Environments & Databases

Three isolated environments, each with its own PostgreSQL database:

| Environment | DB name | Spring profile | Purpose |
|---|---|---|---|
| **local** | `myiu_local` | `local` | Developer workstation — safe to reset |
| **dev** | `myiu_dev` | `dev` | Shared dev server, team testing |
| **prod** | `myiu_prod` | `prod` | Production — protected, no debug |
| **test** | `myiu_test` | `test` | CI/CD — Testcontainers spins up real PostgreSQL |

Profile is activated via `SPRING_PROFILES_ACTIVE` environment variable.
On local dev this is set automatically by the `.env` file (loaded by `spring-dotenv`).

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21 (Eclipse Temurin LTS), Spring Boot 3.4.1 |
| Auth | Azure AD OAuth2 + JWT (jjwt 0.12.5) — `sessionId` embedded in JWT claim |
| Session security | JWT revocation via per-request DB check (`existsByIdAndRevokedFalse`) |
| Database | PostgreSQL 16, Flyway V1–V8 migrations |
| Real-time | WebSocket / STOMP over SockJS — notifications push |
| Email | JavaMailSender (optional) — async HTML email on form approve/reject |
| Rate limiting | Bucket4j token-bucket — 5/min login, 60/min search, 10/hr upload |
| Caching | Caffeine W-TinyLFU — rate limit buckets + L1 cache |
| Observability | Spring Actuator → Prometheus → Grafana |
| API docs | SpringDoc OpenAPI — `/swagger-ui.html` (disabled on prod) |
| Frontend | React 18, TypeScript, Vite 5, TailwindCSS, React Query v5 |
| i18n | i18next (VI/EN) + Google Translate widget |
| Container | Docker (multi-stage, Eclipse Temurin JRE) + Nginx (frontend) |
| CI/CD | GitHub Actions — ci.yml → deploy-dev.yml → deploy-prod.yml |

---

## LMS Features

| Feature | Status | Notes |
|---|---|---|
| Microsoft SSO login | ✅ Done | Azure AD OAuth2 + JWT |
| Course management | ✅ Done | CRUD, enrollments, groups |
| Course posts (feed/materials/assignments) | ✅ Done | Post types with attachments |
| Assignment submission | ✅ Done | Student submit/resubmit, lecturer grade, LATE detection |
| Attendance tracking | ✅ Done | Lecturer mark P/L/A/E per session, student history view |
| Grades | ✅ Done | Per-course grade sheet, student self-view |
| Timetable | ✅ Done | Weekly calendar view (student/lecturer). Lecturer manages schedules from **CourseDetail → Lịch học tab** |
| Forms & approval workflow | ✅ Done | Template-based, email notifications on approve/reject |
| Real-time notifications | ✅ Done | WebSocket STOMP push |
| Support tickets | ✅ Done | Submit, track, admin respond |
| Admin panel | ✅ Done | User management, provisioning, support ticket management |
| Session management | ✅ Done | Meta-style active sessions + remote revoke |
| Course self-enrollment | 🔲 Planned | Medium priority |
| Email broadcast on announcement | 🔲 Planned | Medium priority |
| Course progress tracking | 🔲 Planned | Nice to have |
| Discussion forum | 🔲 Planned | Nice to have |

---

## Project structure

```
myIU/
├── backend/
│   ├── src/main/java/com/myiu/portal/
│   │   ├── config/
│   │   │   ├── AsyncConfig.java          # geoIpExecutor (GeoIP), emailExecutor (email sending)
│   │   │   ├── CacheConfig.java          # Caffeine W-TinyLFU
│   │   │   ├── RateLimitFilter.java      # Token-bucket O(1) rate limiting (Bucket4j)
│   │   │   ├── SecurityConfig.java       # CORS, filter chain, OAuth2, JWT, WebSocket
│   │   │   ├── WebSocketConfig.java      # STOMP broker + SockJS endpoint
│   │   │   ├── StorageConfig.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── controller/                   # 19 REST controllers
│   │   │   ├── AuthController.java
│   │   │   ├── UserController.java
│   │   │   ├── CourseController.java
│   │   │   ├── CourseGroupController.java
│   │   │   ├── CoursePostController.java
│   │   │   ├── GradeController.java
│   │   │   ├── AssignmentSubmissionController.java  # Submit, grade assignments
│   │   │   ├── AttendanceController.java             # Mark & view attendance
│   │   │   ├── AdminController.java                  # Admin: stats, users, tickets, provision
│   │   │   ├── FormController.java       # Templates CRUD + submission approval + email trigger
│   │   │   ├── TimetableController.java  # Course schedule management
│   │   │   ├── NotificationController.java
│   │   │   ├── PostController.java
│   │   │   ├── CommentController.java
│   │   │   ├── BlockController.java
│   │   │   ├── GroupMemberController.java
│   │   │   ├── StorageController.java
│   │   │   ├── SupportController.java
│   │   │   └── SessionController.java
│   │   ├── dto/
│   │   │   ├── CursorPage.java           # Cursor-based pagination (O(log N))
│   │   │   ├── ApiResponse.java          # Uniform response wrapper { data, message, error }
│   │   │   ├── CourseScheduleRequest.java
│   │   │   └── TimetableEntryDTO.java
│   │   ├── entity/                       # 22 JPA entities
│   │   │   ├── AssignmentSubmission.java # coursePostId+studentId unique; status SUBMITTED/LATE/GRADED
│   │   │   └── Attendance.java           # courseId+studentId+date unique; status PRESENT/ABSENT/LATE/EXCUSED
│   │   ├── repository/
│   │   ├── security/
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── JwtService.java
│   │   │   ├── OAuth2SuccessHandler.java
│   │   │   └── WebSocketAuthInterceptor.java  # JWT auth for STOMP connections
│   │   ├── service/
│   │   │   ├── EmailService.java         # @Async HTML email — approved/rejected notifications
│   │   │   ├── TimetableService.java     # Course schedule logic
│   │   │   ├── GeoIpService.java         # @Async GeoIP enrichment
│   │   │   ├── NotificationService.java
│   │   │   ├── SessionService.java
│   │   │   └── UserProvisioningService.java  # Excel-driven bulk user create/deactivate
│   │   └── util/
│   │       └── UserAgentParser.java
│   ├── src/main/resources/
│   │   ├── application.yml               # Base config
│   │   ├── application-local.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   ├── application-test.yml
│   │   └── db/migration/
│   │       ├── V1__initial_schema.sql    # users, posts, courses, forms, notifications, grades
│   │       ├── V2__admin_users.sql
│   │       ├── V3__user_provisioning.sql
│   │       ├── V4__support_tickets.sql
│   │       ├── V5__login_sessions.sql
│   │       ├── V6__course_schedules.sql
│   │       ├── V7__assignment_submissions.sql  # assignment_submissions table
│   │       └── V8__attendance_records.sql      # attendance_records table
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── _auth/                        # Sign-in, OAuth2 callback, ForgotPassword
│   │   ├── _admin/                       # Admin panel (auth-protected /admin/* routes)
│   │   │   ├── AdminLoginPage.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminDashboard.tsx        # Live stats (users/courses/tickets)
│   │   │   ├── AdminUsersPage.tsx        # User list, search, activate/deactivate
│   │   │   ├── AdminProvisionPage.tsx    # Excel upload for bulk user provisioning
│   │   │   └── AdminSupportPage.tsx      # Support ticket list + respond
│   │   ├── _root/pages/                  # Student/lecturer pages
│   │   │   ├── CourseDetail.tsx          # Tabs: Feed · Materials · Assignments · Attendance · Grades · Members · Lịch học
│   │   │   └── ... (20+ other pages)
│   │   ├── components/shared/            # Topbar, LeftSidebar, NotificationBell
│   │   ├── constants/                    # FORM_STATUS, FILE_TYPE_META, FORM_CATEGORIES
│   │   ├── hooks/
│   │   │   └── useNotificationSocket.ts  # WebSocket STOMP hook
│   │   ├── lib/react-query/              # All queries & mutations
│   │   ├── locales/                      # vi.json, en.json (i18next)
│   │   └── types/index.ts
│   ├── public/assets/images/
│   │   └── logo_aftersignin.svg          # IU seal + institution text (app header)
│   ├── index.html                        # Google Translate widget (vi/en only)
│   ├── vite.config.ts                    # define: { global: 'globalThis' } for SockJS
│   └── Dockerfile
│
├── .github/workflows/
│   ├── ci.yml
│   ├── deploy-dev.yml
│   └── deploy-prod.yml
│
├── docker-compose.local.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── Makefile
└── backend/.env.example
```

---

## Local setup (first time)

### Prerequisites

- **Java 21** — Eclipse Temurin LTS
- **Node.js 22+**
- **Docker Desktop** (Windows/macOS) or Docker Engine (Linux)
- **Git Bash** (Windows — needed for Makefile)

> **Windows: set JAVA_HOME before running Maven**
> ```powershell
> $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
> $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
> ```

### 1. Start local PostgreSQL

```bash
make start
# or: docker compose -f docker-compose.local.yml up -d
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Fill in: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID
```

### 3. Start portal backend

```bash
# Git Bash / macOS / Linux
make portal
# or: cd backend && SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

# Windows PowerShell
cd backend
$env:SPRING_PROFILES_ACTIVE = "local"
.\mvnw.cmd spring-boot:run
```

Flyway runs V1–V8 migrations automatically on first start.

### 4. Start portal frontend

```bash
make fe-portal
# or: cd frontend && npm install && npm run dev
# → http://localhost:5173
```

### Admin panel

The admin panel is embedded in the portal frontend at `/admin`. Create the first admin via:

```
POST /api/admin/auth/setup  { "email": "...", "name": "...", "password": "..." }
```

Then log in at `http://localhost:5173/admin`.

### All commands at a glance

```bash
make help           # show all commands
make start          # start PostgreSQL Docker (local)
make stop           # stop containers
make portal         # run portal backend (local profile)
make admin          # run admin backend (local profile)
make fe-portal      # run portal frontend dev server
make fe-admin       # run admin frontend dev server
make build          # build all JARs
make test           # run all backend tests
make images         # build all Docker images
make db-reset       # wipe and recreate local DB
```

---

## Environment variables

Copy `backend/.env.example` → `backend/.env` and fill in your values.

| Variable | Required | Default (local only) | Description |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | — | `local` | Active Spring profile |
| `AZURE_CLIENT_ID` | ✓ | — | Azure App Registration client ID |
| `AZURE_CLIENT_SECRET` | ✓ | — | Azure App Registration client secret |
| `AZURE_TENANT_ID` | ✓ | — | Azure AD tenant ID |
| `DB_URL` | — | `jdbc:postgresql://localhost:5432/myiu_local` | PostgreSQL JDBC URL |
| `DB_USERNAME` | — | `postgres` | DB username |
| `DB_PASSWORD` | — | `postgres` | DB password |
| `JWT_SECRET` | ✓ prod | hardcoded local only | Min 256-bit. **Never use local default on any server.** |
| `FRONTEND_URL` | — | `http://localhost:5173` | Allowed CORS origin + email CTA base URL |
| `APP_BASE_URL` | — | `http://localhost:8080` | Backend public base URL |
| `UPLOAD_DIR` | — | `./uploads` | File upload directory |
| `PROVISION_MAX_CREATE` | — | `200` | Max users per provisioning run |
| `PROVISION_MAX_DELETE` | — | `100` | Max deactivations per provisioning run |

> **Dev/prod:** `JWT_SECRET` has **no fallback** — app refuses to start if missing.
> Generate: `openssl rand -hex 64`

---

## Authentication flow

```
1. Browser → GET /oauth2/authorization/microsoft
2. Spring Security saves OAuth2 state to cookie (3 min TTL, stateless)
3. Redirect to Azure AD login page
4. User authenticates with Microsoft
5. Azure → GET /login/oauth2/code/microsoft?code=...&state=...
6. OAuth2SuccessHandler:
     a. Validates Microsoft token
     b. Checks: email in users table AND is_active = true
     c. sessionService.createSession(user, request) — saves session, kicks off async GeoIP
     d. Embeds sessionId UUID into JWT claim
     e. Redirects → /auth/callback?token=<jwt>
7. Frontend stores JWT in localStorage
8. Every request: Authorization: Bearer <jwt>
   JwtAuthenticationFilter:
     → extract sessionId from JWT
     → check DB: existsByIdAndRevokedFalse(sessionId)
     → if revoked → 401 → client auto-redirects to /sign-in?reason=session_expired
```

---

## Real-time notifications (WebSocket)

```
Frontend useNotificationSocket hook
  └── SockJS → /ws (HTTP upgrade)
        └── WebSocketAuthInterceptor — validate JWT from STOMP CONNECT header
              └── STOMP broker → /topic/notifications/{userId}
                    └── NotificationService.push() → sends to topic
```

---

## Login session tracking (Meta-style)

| Field | Source |
|---|---|
| IP address | `X-Forwarded-For` → `X-Real-IP` → `getRemoteAddr()` |
| Country / City | ip-api.com — async, doesn't block login |
| Browser / Version | User-Agent header |
| OS | User-Agent header |
| Device type | User-Agent header (desktop / mobile / tablet) |

Users can see all active sessions in Settings → revoke individual sessions or all other sessions.

---

## Rate limiting

Token-bucket algorithm (Bucket4j) — O(1) per request.

| Endpoint pattern | Limit | Scope |
|---|---|---|
| `/oauth2/authorization/microsoft` | 5 / minute | per IP |
| `/api/*/search` | 60 / minute | per IP |
| `POST /api/*/upload` | 10 / hour | per IP |
| `/api/**` (general) | 120 / minute | per IP |

Returns `429 Too Many Requests` with `Retry-After` header.

---

## API documentation

- **Local/Dev:** `http://localhost:8080/swagger-ui.html`
- **Prod:** Swagger disabled
- Raw schema: `/api-docs`

---

## User provisioning (admin)

Admin uploads Excel via `/admin/provision`:

**Sheet "Create"** — creates/updates users:
| email | name | role |
|---|---|---|
| student@iu.edu.vn | Nguyen Van A | student |

**Sheet "Delete"** — sets `is_active = false` (soft delete):
| email |
|---|
| old.user@iu.edu.vn |

Endpoint: `POST /api/admin/provision` (file field: `file`).

---

## Notes

- Portal backend owns the schema — Flyway V1–V8 migrations run on startup.
- Admin backend uses `ddl-auto: none` — reads from portal's schema, never writes DDL.
- OAuth2 state is stored in a short-lived **cookie** (not HTTP session) — backend is fully stateless.
- Swagger UI is available on local/dev but **disabled on production**.
- For deployment see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
- For architecture details see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- For API reference see [docs/API_ROUTES.md](docs/API_ROUTES.md).

---

## Developer Gotchas

Critical notes accumulated during development — read this before touching the codebase.

### 1. Microsoft OAuth2 email case normalization
Microsoft Azure AD returns the user's email in **ANY case** (e.g. `ITITIU21354@student.hcmiu.edu.vn`). PostgreSQL `findByEmail` is case-sensitive, so the lookup fails and the user hits the `not_provisioned` error page even though their account exists.

**Fix already applied** in two places — do not remove:
- `OAuth2SuccessHandler.java` — `email = email.toLowerCase()` before `findByEmail()`
- `UserDetailsServiceImpl.java` — `normalizedEmail = email.toLowerCase()` before loading JWT principal

If you add other code that looks up users by email, always call `.toLowerCase()` first.

### 2. JPA lazy loading + `open-in-view: false`
`spring.jpa.open-in-view: false` is set globally. This means the Hibernate session **closes after each repository call**, not after the HTTP response is sent. Any service method that traverses a LAZY relation (e.g. `user.getRoles()`, `course.getGroups()`) outside of the repository call **will throw `LazyInitializationException`** unless the method is annotated with `@Transactional(readOnly = true)`.

This has already bitten us with `CourseService.getAll()` and `CourseService.getById()`. Always add `@Transactional(readOnly = true)` to service methods that read entity relations.

### 3. `user_roles` table — `@ElementCollection` JPA gotcha
Roles are stored in a separate `user_roles` table via `@ElementCollection`. You **cannot** filter on them with a plain `WHERE u.role = :role` JPQL. Use a JOIN:

```java
// Correct — JOIN on the element collection
@Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role AND ...")
List<User> searchByNameOrEmailAndRole(@Param("q") String q, @Param("role") String role);
```

Roles are stored **without** the `ROLE_` prefix (`student`, `lecturer`). `UserDetailsServiceImpl` adds the prefix when constructing `GrantedAuthority` for Spring Security. The `?role=` query param on `GET /api/users/search` accepts the raw value without prefix (e.g. `?role=lecturer`).

### 4. Flyway `out-of-order: true` in dev profile
`application-dev.yml` sets `spring.flyway.out-of-order: true`. This is intentional — the seed migrations (`V7__seed_base.sql`, `V10__seed_extended.sql`) sometimes need to be re-run after a manual `DELETE FROM flyway_schema_history` on the dev DB. Without this flag Flyway refuses to apply migrations whose version numbers are lower than the latest applied version.

Do not set this flag on prod.

### 5. Admin backend must be started separately
The admin panel (`myIU-admin`, port 8081) is a **completely separate Spring Boot application**. It is NOT started by `make portal`. If the admin frontend throws a network error when creating users, the admin backend is probably not running.

```powershell
# Start admin backend
cd ..\myIU-admin\backend
.\mvnw.cmd spring-boot:run
# → http://localhost:8081
```

### 6. React 18 + browser auto-translate — DOM crash
Chrome/Edge's Google Translate wraps Vietnamese text nodes in `<font>` tags between React renders. When a dynamic list (e.g. a `<tr>` in FormsPage) re-renders, React's `insertBefore` tries to insert a node relative to the original text node — which has since been moved inside the `<font>` wrapper — causing an `insertBefore` / `NotFoundError` crash.

**Always add `translate="no"` to:**
- Dynamic table rows (`<tr translate="no">`)
- Modals that contain form fields or lists

Additionally, use `startTransition` when changing tabs/pages immediately after closing a modal to prevent React 18 batching the modal unmount with the parent re-render:

```tsx
const [, startTransition] = useTransition();
// ...
onSuccess={() => {
  setSubmitTarget(null);            // unmount modal — synchronous
  startTransition(() => setPageTab('my-requests'));  // low-priority tab switch
}}
```

### 7. Schedule management (CourseDetail → Lịch học tab)
The `ScheduleTab` component lives inside `CourseDetail.tsx`. React Query hooks are defined in `lib/react-query/queriesAndMutations.ts`:
- `useGetCourseSchedules(courseId)` — `GET /api/courses/{id}/schedules`
- `useCreateCourseSchedule()` — `POST /api/courses/{id}/schedules`
- `useDeleteCourseSchedule()` — `DELETE /api/course-schedules/{scheduleId}`

Lecturers see an add-form + delete buttons; students see read-only grouped by day.

### 8. File storage — portal backend only
All uploaded files (form templates, form submissions) are served from the **portal backend** at `/api/storage/files/{filename}`. The admin backend also generates URLs in this format when creating or updating form templates so that portal users can download them. Do not add a separate file-serving endpoint in the admin backend.

### 9. `FormSubmitModal.tsx` — state order matters
`setIsSubmitting(false)` must be called **before** `onSuccess()`. If called after (or in a `finally` block), React 18 batches the `false` state update together with the parent's unmount-triggered re-render, causing a fiber inconsistency crash. See the comment in `handleSubmit()` in `FormSubmitModal.tsx`.
