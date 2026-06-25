# myIU Portal

University portal for IU (International University).
Students and lecturers sign in via **Microsoft 365 SSO**.
Role-based access enforced at API and UI level.

---

## Architecture overview

```
myIU/ (this repo)                myIU-admin/ (separate repo)
├── backend-java  :8080  ──────── shared PostgreSQL ──── backend  :8081
└── frontend      :5173                                   frontend :3000
```

| Role | Application | Auth method |
|---|---|---|
| `student` | myIU portal (5173 / 8080) | Microsoft SSO → JWT |
| `lecturer` | myIU portal (5173 / 8080) | Microsoft SSO → JWT |
| `admin` | myIU-admin (3000 / 8081) | Email + password → JWT |

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
| Database | PostgreSQL 16, Flyway V1–V5 migrations |
| Rate limiting | Bucket4j token-bucket — 5/min login, 60/min search, 10/hr upload |
| Caching | Caffeine W-TinyLFU — rate limit buckets + L1 cache (admin) |
| Observability | Spring Actuator → Prometheus → Grafana |
| API docs | SpringDoc OpenAPI — `/swagger-ui.html` (disabled on prod) |
| Frontend | React 18, TypeScript, Vite 5, TailwindCSS, React Query |
| Container | Docker (multi-stage, Eclipse Temurin JRE) + Nginx (frontend) |
| CI/CD | GitHub Actions — ci.yml → deploy-dev.yml → deploy-prod.yml |

---

## Project structure

```
myIU/
├── backend-java/
│   ├── src/main/java/com/myiu/portal/
│   │   ├── config/
│   │   │   ├── AsyncConfig.java          # geoIpExecutor thread pool (GeoIP async enrichment)
│   │   │   ├── CacheConfig.java          # Caffeine W-TinyLFU cache for rate limit buckets
│   │   │   ├── RateLimitFilter.java      # Token-bucket O(1) rate limiting (Bucket4j)
│   │   │   ├── SecurityConfig.java       # CORS, filter chain, OAuth2, JWT, 401 entry point
│   │   │   ├── StorageConfig.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── controller/                   # 14 REST controllers
│   │   ├── dto/
│   │   │   └── CursorPage.java           # Cursor-based pagination (O(log N) vs OFFSET O(N))
│   │   ├── entity/                       # 19 JPA entities
│   │   ├── repository/                   # 14 Spring Data repositories
│   │   ├── security/
│   │   │   ├── JwtAuthenticationFilter.java  # Session revocation check + sets sessionId attribute
│   │   │   ├── JwtService.java               # HS384, generateToken(subject, claims)
│   │   │   ├── OAuth2SuccessHandler.java     # Login → createSession → embed sessionId in JWT
│   │   │   └── ...
│   │   ├── service/
│   │   │   ├── GeoIpService.java         # @Async lookupAndEnrich() — doesn't block login
│   │   │   ├── SessionService.java       # createSession: save fast, enrich geo async
│   │   │   └── ...
│   │   └── util/
│   │       └── UserAgentParser.java      # Parses browser/OS/device from User-Agent
│   ├── src/main/resources/
│   │   ├── application.yml               # Base config (Jackson, multipart, OAuth2 structure)
│   │   ├── application-local.yml         # Local: myiu_local, debug logging, Swagger enabled
│   │   ├── application-dev.yml           # Dev: myiu_dev, INFO logging, Swagger enabled
│   │   ├── application-prod.yml          # Prod: myiu_prod, WARN logging, Swagger disabled
│   │   ├── application-test.yml          # Test: Testcontainers, no hardcoded secrets
│   │   └── db/migration/                 # V1–V5 Flyway migrations
│   ├── src/test/java/com/myiu/portal/
│   │   ├── SessionServiceTest.java       # Unit tests (Mockito, no DB)
│   │   └── GeoIpServiceTest.java
│   ├── Dockerfile                        # Multi-stage: JDK builder → JRE runtime
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── _auth/                        # Sign-in, OAuth2 callback
│   │   ├── _root/pages/Settings.tsx      # Meta-style login sessions tab
│   │   ├── lib/api/client.ts             # fetch wrapper — 401 → auto-logout
│   │   └── lib/react-query/              # React Query hooks
│   ├── Dockerfile                        # Node builder → Nginx runtime
│   ├── nginx.conf                        # SPA routing + gzip + immutable cache headers
│   ├── .env.development                  # VITE_API_URL=http://localhost:8080
│   └── .env.production                   # VITE_API_URL=https://api.myiu.edu.vn
│
├── .github/workflows/
│   ├── ci.yml                            # PR gate: lint → test → build-check
│   ├── deploy-dev.yml                    # Push to develop → deploy to dev server
│   └── deploy-prod.yml                   # Push tag v* → deploy to production
│
├── docker-compose.local.yml              # PostgreSQL only (backends run on host)
├── docker-compose.dev.yml                # Full stack — dev server
├── docker-compose.prod.yml               # Full stack — production
├── Makefile                              # Cross-platform convenience commands
├── .env.local.example                    # Template for local .env
├── .env.dev.example                      # Template for dev server
└── .env.prod.example                     # Template for production
```

---

## Local setup (first time)

### Prerequisites

- **Java 21** — Eclipse Temurin LTS
- **Node.js 22+**
- **Docker Desktop** (Windows/macOS) or Docker Engine (Linux)
- **Git Bash** (Windows — needed for Makefile and shell scripts)

> **Windows: set JAVA_HOME before running Maven**
> ```powershell
> $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
> $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
> ```

### 1. Start local PostgreSQL

```bash
# Creates myiu_local database in Docker
make start
# or without make:
docker compose -f docker-compose.local.yml up -d
```

### 2. Configure environment

```bash
# Portal backend
cp .env.local.example backend-java/.env
# Edit backend-java/.env: fill in AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID
# DB settings already point to myiu_local — no change needed

# Admin backend
cp .env.local.example myIU-admin/backend/.env
# Edit myIU-admin/backend/.env: same Azure values, PORT=8081
```

### 3. Start portal backend

```bash
# Git Bash / macOS / Linux
make portal
# or:
cd backend-java && SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

# Windows PowerShell (no Makefile)
cd backend-java
$env:SPRING_PROFILES_ACTIVE = "local"
.\mvnw.cmd spring-boot:run
```

Flyway runs migrations automatically. Database `myiu_local` is created on first run.

### 4. Start portal frontend

```bash
make fe-portal
# or:
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

### 5. Start admin backend + frontend (optional)

```bash
make admin          # admin backend on :8081
make fe-admin       # admin frontend on :3000
```

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

Copy `.env.local.example` → `backend-java/.env` and fill in your values.

| Variable | Required | Default (local only) | Description |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | — | `local` | Active Spring profile |
| `AZURE_CLIENT_ID` | ✓ | — | Azure App Registration client ID |
| `AZURE_CLIENT_SECRET` | ✓ | — | Azure App Registration client secret |
| `AZURE_TENANT_ID` | ✓ | — | Azure AD tenant ID |
| `DB_URL` | — | `jdbc:postgresql://localhost:5432/myiu_local` | PostgreSQL JDBC URL |
| `DB_USERNAME` | — | `postgres` | DB username |
| `DB_PASSWORD` | — | `postgres` | DB password |
| `JWT_SECRET` | ✓ prod | hardcoded local only | Min 256-bit random string. **Never use local default on any server.** |
| `FRONTEND_URL` | — | `http://localhost:5173` | Allowed CORS origin |
| `APP_BASE_URL` | — | `http://localhost:8080` | Backend public base URL |
| `UPLOAD_DIR` | — | `./uploads` | File upload directory |
| `PROVISION_MAX_CREATE` | — | `200` | Max users per provisioning run |
| `PROVISION_MAX_DELETE` | — | `100` | Max deactivations per provisioning run |
| `SMTP_USER` / `SMTP_PASS` | — | empty | SMTP credentials for notifications |

> **Dev/prod:** `JWT_SECRET` has **no fallback** — app refuses to start if missing.
> Generate: `openssl rand -hex 64`

---

## Authentication flow

```
1. Browser → GET /oauth2/authorization/microsoft
2. Spring Security saves OAuth2 state to cookie (3 min TTL, stateless)
3. Redirect to Azure AD login page (with prompt=select_account)
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

## Login session tracking (Meta-style)

When a user logs in, the backend records:

| Field | Source |
|---|---|
| IP address | `X-Forwarded-For` → `X-Real-IP` → `getRemoteAddr()` |
| Country / City | ip-api.com — async, doesn't block login |
| Browser / Version | User-Agent header (UserAgentParser utility) |
| OS | User-Agent header |
| Device type | User-Agent header (desktop / mobile / tablet) |

Users can see all active sessions in Settings and revoke individual sessions or all other sessions. Revocation takes effect on the next request from that session (no delay — per-request DB check).

---

## Rate limiting

Token-bucket algorithm (Bucket4j) — O(1) per request, no lock contention.

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
- **Prod:** Swagger disabled (security policy)
- Raw schema: `/api-docs` (OpenAPI JSON)

---

## User provisioning (admin)

Admin uploads Excel via myIU-admin portal:

**Sheet "Create"** — creates/updates users:
| email | name | role |
|---|---|---|
| student@iu.edu.vn | Nguyen Van A | student |
| lecturer@iu.edu.vn | Tran Thi B | lecturer |

**Sheet "Delete"** — sets `is_active = false` (soft delete, data preserved):
| email |
|---|
| old.user@iu.edu.vn |

---

## Notes

- Portal backend owns the schema — Flyway migrations run on startup.
- Admin backend uses `ddl-auto: none` — reads from portal's schema, never writes DDL.
- Both backends share the same PostgreSQL instance, different by environment (local/dev/prod).
- OAuth2 state is stored in a short-lived **cookie** (not HTTP session) — backend is fully stateless.
- Swagger UI is available on local/dev but **disabled on production**.
- For deployment documentation see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
- For architecture details see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
