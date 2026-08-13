# myIU Portal — Deployment Guide

---

## Overview

Three environments, one codebase:

| Environment | Trigger | DB |
|---|---|---|
| **local** | `make start` + `make portal` | `myiu_local` |
| **dev / prod** | Manual — no CI/CD pipeline yet (see below) | `myiu_dev` / `myiu_prod` |

> **Admin panel is a separate deployment.** `myIU-admin` is its own sibling repo (not a subdirectory of this one) with its own backend (`:8081`) and frontend (`:3000`). It must be built/deployed independently of the portal.

> **No automated dev/prod deploy pipeline currently exists.** Earlier drafts of `deploy-dev.yml` / `deploy-prod.yml` / `docker-compose.dev.yml` / `docker-compose.prod.yml` assumed `myIU-admin` was a subdirectory of this repo (`context: myIU-admin/backend`) — since it's actually a separate repo, those workflows could never check it out and were removed rather than left broken. Building a real dev/prod pipeline means either deploying the two apps independently (separate workflows per repo) or checking out both repos in one workflow (e.g. via a second `actions/checkout` step with `repository: your-org/myIU-admin`).

---

## Local Development

### Start the database

```bash
make start
# Creates myiu_local in PostgreSQL docker container on :5432
```

### Configure environment

```bash
cp backend/.env.example backend/.env
# Required: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID
# Optional: SMTP_USER, SMTP_PASS (Gmail App Password) — for email notifications
#           FRONTEND_URL — defaults to http://localhost:5173
```

### Run backend on host (with hot reload)

```bash
# Terminal 1 — portal backend
make portal
# → http://localhost:8080/swagger-ui.html
```

### Run frontend

```bash
# Terminal 2
make fe-portal   # → http://localhost:5173
```

### Admin panel

Separate app, separate repo (`myIU-admin`) — not started by anything in this repo. First admin
account is auto-seeded on its first boot from `ADMIN_DEFAULT_EMAIL`/`ADMIN_DEFAULT_PASSWORD` in its
own `.env` (defaults `admin@iu.edu.vn` / `Admin@123`, change them). See that repo's README for setup.
Log in at `http://localhost:3000` once it's running.

### Run tests

```bash
make test
# Testcontainers pulls postgres:16 automatically — no local DB needed for tests
```

### Reset local DB

```bash
make db-reset
# Wipes myiu_local volume and recreates it
# Flyway re-runs V1–V8 migrations on next backend start
```

---

## Building Docker Images

### Build all images locally

```bash
make images
```

### Build individual image

```bash
# Portal backend
docker build -t myiu-portal-backend:local backend/

# Portal frontend (inject API URL at build time)
docker build \
  --build-arg VITE_API_URL=https://dev-api.myiu.edu.vn \
  -t myiu-portal-frontend:dev \
  frontend/
```

### Multi-stage build details

```dockerfile
# Stage 1: resolve Maven dependencies (cached when pom.xml unchanged)
# Stage 2: compile + package JAR (-DskipTests)
# Stage 3: Eclipse Temurin 21-jre-alpine (~250MB image)
# Non-root user: adduser appuser
# JVM: -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC
```

---

## Dev / Production Deployment (manual)

There is currently no CI/CD pipeline for dev/prod (see note above). Until one is built, deploy manually per app:

```bash
# Portal (this repo)
docker build -t myiu-portal-backend:TAG backend/
docker build --build-arg VITE_API_URL=<api-url> -t myiu-portal-frontend:TAG frontend/

# Admin (separate repo — run from inside myIU-admin/)
docker build -t myiu-admin-backend:TAG backend/
docker build --build-arg VITE_API_URL=<admin-api-url> -t myiu-admin-frontend:TAG frontend/
```

Push each image to your registry and run it on the target server with the right env file (`.env.dev`/`.env.prod`, not committed — see `backend/.env.example` in each repo for the variables each service needs). Point both backends at the same PostgreSQL instance/database; only the portal backend runs Flyway.

---

## Database Migration

Flyway runs automatically on backend startup. **Only portal backend runs Flyway.**

```bash
# Check migration status (local)
cd backend
./mvnw flyway:info -Dspring.profiles.active=local

# Run migrations manually (dev)
./mvnw flyway:migrate -Dspring.profiles.active=dev

# NEVER run flyway:clean on dev or prod — it drops all tables
```

New migrations: add `V{N+1}__description.sql` to `backend/src/main/resources/db/migration/`.

Current migrations:
- V1: initial schema (users, posts, courses, forms, notifications, grades)
- V2: admin_users
- V3: user_provisioning audit tables
- V4: support_tickets
- V5: login_sessions
- V6: course_schedules
- V7: assignment_submissions
- V8: attendance_records

---

## Monitoring

| Endpoint | Purpose |
|---|---|
| `http://server:8080/actuator/health` | Liveness check |
| `http://server:8080/actuator/prometheus` | Prometheus metrics scrape |
| `http://server:9090` | Prometheus UI |
| `http://server:3001` | Grafana dashboards |

Key metrics to watch:
- `http_server_requests_seconds` — request latency p95/p99
- `hikaricp_connections_active` — DB pool utilization
- `jvm_memory_used_bytes` — heap usage (alert if > 80%)

---

## Cross-Platform Notes

| Task | Windows (Git Bash) | macOS / Linux |
|---|---|---|
| Start DB | `make start` | Same |
| Run backend | `SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run` | Same |
| Run backend (PowerShell) | `$env:SPRING_PROFILES_ACTIVE="local"; .\mvnw.cmd spring-boot:run` | N/A |
| Build JAR | `./mvnw package -DskipTests` | Same |
| Generate JWT secret | `openssl rand -hex 64` (in Git Bash) | Same |

---

## Troubleshooting

### Backend fails to start: "Could not resolve placeholder 'JWT_SECRET'"

On dev/prod profile, `JWT_SECRET` env var is not set — no fallback on non-local profiles.
Fix: add `JWT_SECRET=...` to your `.env` file.

### Email not sending

Check: `SMTP_USER` and `SMTP_PASS` are set in `.env`. Use a **Gmail App Password** (not your account password): Google Account → Security → 2-Step Verification → App passwords.
Backend logs warning `[EmailService] SMTP not configured — skipping` if fromAddress is blank.

### WebSocket connection fails

Ensure `/ws` is in the CORS allowed origins and the backend's `SecurityConfig` permits `/ws/**` without authentication (JWT is validated at STOMP level by `WebSocketAuthInterceptor`).

### Login fails: "Schema-validation: missing table [X]"

Flyway migrations haven't all run. Check:
```bash
./mvnw flyway:info -Dspring.profiles.active=local
```
Ensure V1–V8 exist in `backend/src/main/resources/db/migration/`.

### assignment_submissions or attendance_records table missing

Flyway V7 and V8 migrations may not have been applied. Run:
```bash
./mvnw flyway:migrate -Dspring.profiles.active=local
```
If V7/V8 SQL files don't exist yet, create them:
- `V7__assignment_submissions.sql` — CREATE TABLE assignment_submissions with unique constraint on (course_post_id, student_id)
- `V8__attendance_records.sql` — CREATE TABLE attendance_records with unique constraint on (course_id, student_id, date)

### Docker build fails: "mvnw: permission denied"

```bash
git update-index --chmod=+x backend/mvnw
git commit -m "fix: mvnw executable permission"
```

### Port 5432 already in use

```yaml
# docker-compose.local.yml
ports:
  - "5433:5432"
```
Then update `DB_URL=jdbc:postgresql://localhost:5433/myiu_local`.

### "Network Error" in the admin frontend

The admin backend (separate `myIU-admin` repo, port 8081) isn't running — it's never started by
anything in this repo (`make portal`/`make fe-portal` only touch the portal). Start it from that
repo, or via `make admin` here if you have both repos checked out as siblings.
