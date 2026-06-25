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

---

## Local Development

### Start the database

```bash
# Windows (Git Bash), macOS, or Linux — same command
make start
# Creates myiu_local in PostgreSQL docker container on :5432
```

### Run backends on host (with hot reload)

```bash
# Terminal 1 — portal backend
make portal
# → http://localhost:8080/swagger-ui.html

# Terminal 2 — admin backend
make admin
# → http://localhost:8081/swagger-ui.html
```

### Run frontends

```bash
# Terminal 3
make fe-portal   # → http://localhost:5173

# Terminal 4
make fe-admin    # → http://localhost:3000
```

### Run tests

```bash
make test
# Testcontainers pulls postgres:16 automatically — no local DB needed for tests
```

### Reset local DB

```bash
make db-reset
# Wipes myiu_local volume and recreates it
# Flyway re-runs all migrations on next backend start
```

---

## Building Docker Images

### Build all images locally

```bash
make images
# Builds: myiu-portal-backend:local, myiu-admin-backend:local,
#         myiu-portal-frontend:local, myiu-admin-frontend:local
```

### Build individual image

```bash
# Portal backend
docker build -t myiu-portal-backend:local backend-java/

# Portal frontend (inject API URL at build time)
docker build \
  --build-arg VITE_API_URL=https://dev-api.myiu.edu.vn \
  -t myiu-portal-frontend:dev \
  frontend/
```

### Multi-stage build details

```dockerfile
# Stage 1: resolve Maven dependencies (cached when pom.xml unchanged)
# Stage 2: compile + package JAR (DskipTests)
# Stage 3: Eclipse Temurin 21-jre-alpine (no JDK, smaller image ~250MB)
# Non-root user: adduser appuser
# JVM: -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC
```

---

## Dev Server Deployment

### One-time server setup

```bash
# On the dev server (Linux)
mkdir -p /opt/myiu
cd /opt/myiu
# Copy docker-compose.dev.yml from this repo
```

### Automated deployment (GitHub Actions)

Push to `develop` branch triggers `.github/workflows/deploy-dev.yml`:

1. Builds 4 Docker images and pushes to `ghcr.io`
2. SSHs into dev server and runs:
   ```bash
   docker compose -f docker-compose.dev.yml --env-file .env.dev pull
   docker compose -f docker-compose.dev.yml --env-file .env.dev up -d --remove-orphans
   docker image prune -f
   ```

### Manual deployment to dev

```bash
# On dev server or from CI with SSH access
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
| `PROD_PORTAL_JWT` | Portal JWT secret — generate: `openssl rand -hex 64` |
| `PROD_ADMIN_JWT` | Admin JWT secret — different from portal |
| `PROD_AZURE_CLIENT_ID` | Azure production app client ID |
| `PROD_AZURE_CLIENT_SECRET` | Azure production app client secret |
| `PROD_AZURE_TENANT_ID` | Azure tenant ID |
| `PROD_PORTAL_FRONTEND_URL` | e.g. `https://myiu.edu.vn` |
| `PROD_ADMIN_FRONTEND_URL` | e.g. `https://admin.myiu.edu.vn` |
| `PROD_PORTAL_API_URL` | e.g. `https://api.myiu.edu.vn` |
| `PROD_ADMIN_API_URL` | e.g. `https://admin-api.myiu.edu.vn` |

Same pattern for `DEV_*` secrets (pointing to dev server).

### Deploy to production

```bash
# Tag a release (triggers deploy-prod.yml automatically)
git tag v1.2.0
git push origin v1.2.0

# OR: manual dispatch via GitHub Actions UI
# → Actions → Deploy → Prod → Run workflow → enter tag
```

**Production requires approval**: set up a GitHub **Environment** named `prod` with required reviewers.

### One-time prod server setup

```bash
# On production server
apt-get install -y docker.io docker-compose-plugin
mkdir -p /opt/myiu
cd /opt/myiu
# docker-compose.prod.yml is written by the GitHub Actions deploy script
```

---

## Rollback

### Roll back to previous image tag

```bash
# On server — just change the TAG env var and redeploy
export TAG=dev-abc1234   # previous known-good tag

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Or via GitHub Actions manual dispatch

```
Actions → Deploy → Prod → Run workflow → enter previous tag
```

---

## Database Migration

Flyway runs automatically on backend startup. **Only portal backend runs Flyway.**

```bash
# Check migration status (local)
cd backend-java
./mvnw flyway:info -Dspring.profiles.active=local

# Run migrations manually (dev)
./mvnw flyway:migrate -Dspring.profiles.active=dev

# NEVER run flyway:clean on dev or prod — it drops all tables
```

New migrations: add `V{N+1}__description.sql` to `backend-java/src/main/resources/db/migration/`.

---

## Monitoring

After deploying Prometheus + Grafana (add to docker-compose files):

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
- `rate_limit_429_total` — rate limit hits (custom counter to add)

---

## Cross-Platform Notes

| Task | Windows (Git Bash) | macOS / Linux |
|---|---|---|
| Start DB | `make start` or `docker compose ...` | Same |
| Run backend | `SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run` | Same |
| Run backend (no Bash) | `$env:SPRING_PROFILES_ACTIVE="local"; .\mvnw.cmd spring-boot:run` | N/A |
| Build JAR | `./mvnw package -DskipTests` | Same |
| Docker build | `docker build -t name .` | Same |
| Generate JWT secret | `openssl rand -hex 64` (in Git Bash) | Same |

Docker images are Linux-based (Alpine) — identical on Windows Docker Desktop, macOS Docker Desktop, and Linux servers.

---

## Troubleshooting

### Backend fails to start: "Could not resolve placeholder 'JWT_SECRET'"

You're on dev/prod profile and `JWT_SECRET` env var is not set. This is intentional — no fallback on non-local profiles.

Fix: add `JWT_SECRET=...` to your `.env` file or set the env var.

### Login fails: "Schema-validation: missing table support_tickets"

Flyway migrations haven't all run. Check migration status:
```bash
./mvnw flyway:info -Dspring.profiles.active=local
```
Ensure V4 and V5 migrations exist in `db/migration/`.

### Docker build fails: "mvnw: permission denied"

```bash
git update-index --chmod=+x backend-java/mvnw
git update-index --chmod=+x myIU-admin/backend/mvnw
git commit -m "fix: mvnw executable permission"
```

### Port 5432 already in use

Local PostgreSQL is running. Either stop it or change Docker port:
```yaml
# docker-compose.local.yml
ports:
  - "5433:5432"   # use 5433 on host
```
Then update `DB_URL=jdbc:postgresql://localhost:5433/myiu_local`.
