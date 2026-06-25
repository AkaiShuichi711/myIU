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
│  ┌──────────────────┐  ┌─────────────────┐          │              │
│  │  myIU Portal     │  │  myIU Admin     │◄─────────┘              │
│  │  :5173 / :8080   │  │  :3000 / :8081  │  OAuth2 callback        │
│  └──────────────────┘  └─────────────────┘                        │
│          │                    │                                    │
│          └────────┬───────────┘                                    │
│                   ▼                                                │
│          ┌────────────────┐    ┌────────────────────┐             │
│          │  PostgreSQL 16 │    │  ip-api.com (ext)  │             │
│          │  myiu_{env}    │    │  GeoIP lookup      │             │
│          └────────────────┘    └────────────────────┘             │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. Three-Environment Architecture

Every environment is isolated — separate database, separate secrets, same codebase.

```
┌──────────────────────────────────────────────────────────────────────┐
│  DEVELOPER WORKSTATION  (SPRING_PROFILES_ACTIVE=local)               │
│                                                                      │
│  Backends run on host (hot reload)    PostgreSQL in Docker           │
│  :8080 portal-backend            →   myiu_local                     │
│  :8081 admin-backend             →   myiu_local                     │
│  :5173 portal-frontend (Vite)        (safe to wipe anytime)         │
│  :3000 admin-frontend  (Vite)                                        │
└──────────────────────────────────────────────────────────────────────┘
                          │ git push develop
                          ▼ GitHub Actions: deploy-dev.yml
┌──────────────────────────────────────────────────────────────────────┐
│  DEV SERVER  (SPRING_PROFILES_ACTIVE=dev)                            │
│                                                                      │
│  All 5 services in Docker containers                                 │
│  portal-backend  (image: myiu-portal-backend:dev-latest)  → myiu_dev│
│  admin-backend   (image: myiu-admin-backend:dev-latest)   → myiu_dev│
│  portal-frontend (image: myiu-portal-frontend:dev-latest)           │
│  admin-frontend  (image: myiu-admin-frontend:dev-latest)            │
│  postgres        (image: postgres:16-alpine)              myiu_dev  │
└──────────────────────────────────────────────────────────────────────┘
                          │ git tag v1.x.x
                          ▼ GitHub Actions: deploy-prod.yml
┌──────────────────────────────────────────────────────────────────────┐
│  PRODUCTION  (SPRING_PROFILES_ACTIVE=prod)                           │
│                                                                      │
│  Same as dev but:                                                    │
│  - DB: myiu_prod  (separate, guarded)                               │
│  - Swagger: DISABLED                                                 │
│  - Logging: WARN only                                               │
│  - Container memory limits enforced                                  │
│  - No secret fallbacks — app refuses to start if env var missing    │
└──────────────────────────────────────────────────────────────────────┘
```

### Profile → File mapping

| Profile | Config file | DB | JWT fallback | Swagger |
|---|---|---|---|---|
| `local` | `application-local.yml` | `myiu_local` | Yes (dev only) | ✓ |
| `dev` | `application-dev.yml` | `myiu_dev` | No — fail-fast | ✓ |
| `prod` | `application-prod.yml` | `myiu_prod` | No — fail-fast | ✗ |
| `test` | `application-test.yml` | `myiu_test` (Testcontainers) | Yes (test only) | ✗ |

---

## 3. Security Filter Chain

Request flows through filters in this order before reaching any controller:

```
HTTP Request
     │
     ▼
① RateLimitFilter  (Order 1)
     │  Token-bucket O(1): check (IP + endpoint) bucket
     │  Bucket empty? → 429 Too Many Requests + Retry-After header
     │  Rules:
     │    /oauth2/authorization/microsoft → 5/min/IP   (brute-force protection)
     │    /api/*/search                  → 60/min/IP   (scraping protection)
     │    POST /api/*/upload             → 10/hr/IP    (storage flood protection)
     │    /api/**                        → 120/min/IP  (general DDoS buffer)
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
     │       (fail-open on DB error — don't block users if DB temporarily down)
     │  5. UserDetailsServiceImpl.loadByUsername(email)
     │  6. Set SecurityContextHolder authentication
     │  7. request.setAttribute("sessionId", sessionId)
     │
     ▼
④ SecurityConfig.authorizeHttpRequests
     │  /api/auth/**     → permitAll
     │  /oauth2/**       → permitAll
     │  /actuator/**     → authenticated (metrics are internal)
     │  everything else  → authenticated
     │
     ▼
Controller → Service → Repository → PostgreSQL
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
     │       └─ geoIpService.lookupAndEnrich(ip, sessionId)      ← ASYNC (fire & forget)
     │                │
     │                └─ Runs on geoIpExecutor thread pool (2–4 threads)
     │                   ├─ HTTP GET ip-api.com/json/{ip}  (3s timeout)
     │                   └─ UPDATE login_sessions SET country=..., city=...
     │
     ├─ 3. jwtService.generateToken(email, {"sessionId": session.getId()})
     │
     └─ 4. Redirect → /auth/callback?token=<jwt>

Login latency: < 50ms (no GeoIP wait)
GeoIP enrichment: async within ~1–3 seconds
```

Why async GeoIP? The synchronous approach blocked login for up to 3 seconds if ip-api.com was slow.
Pattern: **write-then-enrich**, used by Stripe for async fraud checks, Segment for async enrichment pipelines.

---

## 5. Container Diagram (C4 Level 2)

```
┌───────────────────────────────────────────────────────────────────┐
│  Portal Frontend  (React 18 + Vite + TypeScript)                  │
│                                                                   │
│  AuthContext → JWT in localStorage                                │
│  React Query → staleTime 5min, invalidateQueries on mutation      │
│  lib/api/client.ts:                                               │
│    - 401 received → clearToken() → window.location.replace       │
│      /sign-in?reason=session_expired                              │
│    - 15s request timeout (AbortController)                        │
│    - 60s upload timeout                                           │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │ HTTPS + JWT Bearer
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│  Portal Backend  (Spring Boot 3.4.1 · Java 21 · :8080)           │
│                                                                   │
│  Filter chain: RateLimit → CORS → JWT → Authorization            │
│  Virtual Threads: spring.threads.virtual.enabled=true            │
│    (Java 21 Project Loom — handles I/O-bound load cheaply)       │
│                                                                   │
│  Controllers: Auth · User · Course · CourseGroup · CoursePost     │
│               Grade · Post · Comment · Notification · Block       │
│               Form · GroupMember · Storage · Session              │
│                                                                   │
│  geoIpExecutor: 2–4 thread pool for async GeoIP HTTP calls       │
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
│  V5: login_sessions  (id, user_id, ip, country, city,           │
│       browser, os, device_type, is_revoked, last_active)         │
│                                                                   │
│  Admin backend: ddl-auto=none (reads same DB, no DDL ownership)  │
└───────────────────────────────────────────────────────────────────┘
```

---

## 6. Request Lifecycle

```
HTTP Request arrives at :8080
        │
        ▼
RateLimitFilter
  → Caffeine cache lookup: bucket = buckets.get("1.2.3.4:/api/...")
  → bucket.tryConsumeAndReturnRemaining(1)
  → if empty: return 429
        │
        ▼
JwtAuthenticationFilter
  → extract JWT from Authorization header
  → decode sessionId from JWT claim
  → loginSessionRepository.existsByIdAndRevokedFalse(sessionId)
  → if false: return 401
  → load UserDetails, set SecurityContext
  → store sessionId as request attribute
        │
        ▼
Controller method (@PreAuthorize if needed)
        │
        ▼
Service (business logic)
        │
        ├── sessionRepo.updateLastActive(sessionId, now)  ← heartbeat
        └── other business logic
        │
        ▼
Repository (Spring Data JPA)
  → Hibernate batch flush (batch_size=25)
        │
        ▼
PostgreSQL → JSON Response
```

---

## 7. Algorithms & Data Structures Used

### Token-bucket rate limiting (Bucket4j)

```
Each (IP + endpoint) key → Bucket stored in Caffeine cache
Bucket holds N tokens, refilled at rate R per period

Per request: bucket.tryConsumeAndReturnRemaining(1)
  → Atomic CAS (compare-and-swap) on token counter
  → O(1) time, O(1) space per key, no lock contention
  → 100k concurrent IPs = 100k buckets ≈ ~50MB RAM

Used by: AWS API Gateway, Stripe, Shopify
```

### Cursor-based pagination (CursorPage<T>)

```
OFFSET pagination (naive):  SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 10000
  → PostgreSQL scans 10,020 rows to skip 10,000 → O(N) scan, slow at scale

Cursor pagination:           SELECT * FROM posts WHERE id < :cursor ORDER BY id LIMIT 20
  → Uses B-tree index on id → O(log N) seek, constant page load time
  → Stable: inserts during pagination don't cause row skipping

Facebook Graph API, Twitter API, GitHub API, Stripe API: all cursor-based.
CursorPage.encodeCursor() → opaque base64 token (internal structure hidden from clients)
```

### W-TinyLFU eviction (Caffeine)

```
Traditional LRU: evict Least Recently Used → bad for scan resistance
TinyLFU + Window LRU: tracks frequency sketch (Count-Min Sketch), evicts items
that are unlikely to be accessed again even if recently accessed

Count-Min Sketch: O(1) frequency estimation with O(width × depth) space
  → much better cache hit ratio for "hot" frequently-accessed data

Used by: Caffeine (Java), designed based on research from Google and academics
Rate limit buckets live in this cache → hot IPs stay in memory
```

### Virtual threads (Java 21 Project Loom)

```
Traditional: 1 OS thread per request → each blocks on DB I/O
  → 200 concurrent users × 1MB stack = 200MB + context switch overhead

Virtual threads: M virtual threads → N OS threads (M >> N)
  → blocking on I/O parks the virtual thread, OS thread is reused
  → 10,000 concurrent virtual threads ≈ same overhead as 100 OS threads
  → enabled by: spring.threads.virtual.enabled=true (Spring Boot 3.2+)

Same principle used by Go's goroutines, Kotlin coroutines
```

---

## 8. Database Schema (ER Diagram)

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
  │                          is_revoked (BOOLEAN)
  ├──────────────────┐        last_active (TIMESTAMPTZ)
  │                  ▼        created_at
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
                       └─ course_grades

posts                  form_templates ──── form_submissions
──────────────         support_tickets
id (PK)                notifications
creator_id (FK)        blocks · saves · stored_files
  │
  ├── post_media
  ├── saves
  └── comments

admin_users (separate table — different auth)
```

---

## 9. Observability Stack

```
Portal/Admin Backend
    │
    ├── Spring Actuator → /actuator/health  (liveness check)
    │                  → /actuator/metrics  (JVM, HTTP, DB pool stats)
    │                  → /actuator/prometheus (Prometheus scrape endpoint)
    │
    ▼
Prometheus (docker-compose: prometheus service)
    │  scrape interval: 15s
    │  collects: HTTP latency p50/p95/p99, error rate, DB pool size, JVM heap
    │
    ▼
Grafana (docker-compose: grafana service)
    │  Dashboards: request rate, error rate, active sessions, latency histogram
    │
    ▼
Alertmanager
    │  Alert: error_rate > 5% for 5min → email/Slack
    │  Alert: DB pool exhaustion → page on-call
```

To add Prometheus + Grafana locally:
```bash
# Add to docker-compose.local.yml and run:
docker compose -f docker-compose.local.yml up -d
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

---

## 10. CI/CD Pipeline

```
Developer workstation
    │ git push → PR to develop
    ▼
GitHub Actions: ci.yml
    ├── lint-frontend (tsc --noEmit)
    ├── lint-admin-frontend (tsc --noEmit)
    ├── test-portal (mvnw test, Testcontainers spins up PostgreSQL)
    ├── test-admin  (mvnw test, Testcontainers)
    └── build-check (docker build — no push, just verify image builds)

    │ PR merged → push to develop
    ▼
GitHub Actions: deploy-dev.yml
    ├── docker build + push → ghcr.io/org/myiu-*:dev-{sha}
    └── SSH deploy → docker compose -f docker-compose.dev.yml pull && up -d

    │ git tag v1.x.x (or manual dispatch)
    ▼
GitHub Actions: deploy-prod.yml (requires GitHub Environment "prod" approval)
    ├── docker build + push → ghcr.io/org/myiu-*:v1.x.x + :latest
    └── SSH deploy → docker compose -f docker-compose.prod.yml pull && up -d
```

---

## 11. Non-Functional Requirements

| # | Category | Requirement | How |
|---|---|---|---|
| NF1 | Security | JWT revocation takes effect immediately | Per-request DB check in JwtAuthenticationFilter |
| NF2 | Security | No hardcoded secrets in dev/prod | application-dev/prod.yml have zero fallbacks |
| NF3 | Security | Brute-force login protection | Rate limiting: 5 attempts/min/IP |
| NF4 | Security | Non-root container processes | Dockerfile: adduser appuser |
| NF5 | Security | Session tracking + remote logout | login_sessions table + revocation |
| NF6 | Performance | Login < 50ms despite GeoIP | Async GeoIP enrichment on dedicated thread pool |
| NF7 | Performance | High concurrency with low thread overhead | Java 21 virtual threads |
| NF8 | Performance | Fast pagination at scale | Cursor-based pagination (O(log N)) |
| NF9 | Performance | Repeated rate-limit checks are O(1) | Caffeine cache (W-TinyLFU) for buckets |
| NF10 | Scalability | Schema changes tracked | Flyway V1–V5 versioned migrations |
| NF11 | Scalability | Separate DB per environment | Spring profiles + different DB names |
| NF12 | Observability | Metrics, health, alerting | Actuator + Prometheus + Grafana |
| NF13 | Maintainability | API self-documenting | SpringDoc OpenAPI / Swagger UI |
| NF14 | Reliability | Soft delete for users | is_active=false (data preserved) |
| NF15 | Portability | Reproducible across OS | Docker multi-stage builds, mvnw wrapper |

---

## 12. Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth for users | Microsoft 365 only | All IU staff/students have Microsoft accounts — no password management |
| Session tracking | JWT + DB revocation check | Stateless JWT + real-time revocation = security without sessions |
| GeoIP | Async enrichment (fire & forget) | 3s external HTTP call must not block login response |
| Rate limiting | In-process Caffeine (no Redis needed yet) | Simple, O(1), sufficient for single-node deployment |
| Pagination | Cursor-based | OFFSET is O(N) scan — unusable at 100k+ rows |
| Schema ownership | Portal Flyway only | One source of truth; admin backend reads, never writes DDL |
| Frontend env | Build-time VITE_API_URL | Different API URL per env baked into image — simpler than runtime config injection |
| Virtual threads | `spring.threads.virtual.enabled=true` | Free performance improvement for I/O-bound workload (DB + external HTTP) |
| Container user | Non-root appuser | CIS Benchmark requirement — no daemon privileges in container |
