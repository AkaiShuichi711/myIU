# myIU Portal — Deployment Guide

---

## Overview

Three environments, one codebase:

| Environment | Trigger | DB |
|---|---|---|
| **local** | `make start` + `make portal` | `myiu_local` |
| **dev** | Push to `develop` branch | `myiu_dev` |
| **prod** | Push tag `v*.*.*` or manual dispatch | `myiu_prod` |

All deployments use Docker. Images are stored in GitHub Container Registry (`ghcr.io`).

> The admin panel (`/admin`) is part of the portal frontend — there is no separate admin deployment.

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
# Admin panel → http://localhost:5173/admin
```

### Create first admin account (one-time)

```bash
curl -X POST http://localhost:8080/api/admin/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iu.edu.vn","name":"Admin","password":"yourpassword"}'
```

Then log in at `http://localhost:5173/admin`.

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

## Dev Server Deployment

### Automated deployment (GitHub Actions)

Push to `develop` branch triggers `.github/workflows/deploy-dev.yml`:

1. Builds 2 Docker images (backend + frontend) and pushes to `ghcr.io`
2. SSHs into dev server and runs:
   ```bash
   docker compose -f docker-compose.dev.yml --env-file .env.dev pull
   docker compose -f docker-compose.dev.yml --env-file .env.dev up -d --remove-orphans
   docker image prune -f
   ```

### Manual deployment to dev

```bash
scp .env.dev.example user@dev-server:/opt/myiu/.env.dev
# Edit .env.dev with real credentials

docker compose -f docker-compose.dev.yml --env-file .env.dev pull
docker compose -f docker-compose.dev.yml --env-file .env.dev up -d
```

---

## Production Deployment

### Required GitHub Secrets

Go to **GitHub → Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `REGISTRY` | e.g. `ghcr.io/your-org` |
| `PROD_SSH_HOST` | Production server IP or hostname |
| `PROD_SSH_USER` | SSH username |
| `PROD_SSH_KEY` | Private SSH key (Ed25519 recommended) |
| `PROD_DB_USERNAME` | PostgreSQL username |
| `PROD_DB_PASSWORD` | Strong PostgreSQL password |
| `PROD_PORTAL_JWT` | Portal JWT secret — `openssl rand -hex 64` |
| `PROD_AZURE_CLIENT_ID` | Azure production app client ID |
| `PROD_AZURE_CLIENT_SECRET` | Azure production app client secret |
| `PROD_AZURE_TENANT_ID` | Azure tenant ID |
| `PROD_PORTAL_FRONTEND_URL` | e.g. `https://myiu.edu.vn` |
| `PROD_PORTAL_API_URL` | e.g. `https://api.myiu.edu.vn` |
| `PROD_SMTP_USER` | Gmail address for email notifications |
| `PROD_SMTP_PASS` | Gmail App Password (16-char) |

Same pattern for `DEV_*` secrets (pointing to dev server).

### Deploy to production

```bash
# Tag a release (triggers deploy-prod.yml automatically)
git tag v1.2.0
git push origin v1.2.0
```

**Production requires approval**: set up a GitHub **Environment** named `prod` with required reviewers.

---

## Rollback

```bash
# On server — change the TAG env var and redeploy
export TAG=dev-abc1234   # previous known-good tag
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Or via GitHub Actions manual dispatch → enter previous tag.

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

### Admin panel: 403 on /api/admin/* endpoints

The logged-in user does not have the `admin` role. Admin users authenticate via `/api/admin/auth/login`, which uses a **separate `admin_users` table** — not the regular `users` table. Make sure you're sending the admin JWT (stored in `AdminAuthContext`), not the student/lecturer JWT.
