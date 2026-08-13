# ─────────────────────────────────────────────────────────────────
#  myIU Portal — Makefile
#  Cross-platform: Windows (Git Bash), macOS, Linux
#
#  Install make:
#    Windows: winget install GnuWin32.Make  OR use Git Bash with `make`
#    macOS:   xcode-select --install  (make is included)
#    Linux:   sudo apt install make
# ─────────────────────────────────────────────────────────────────
.PHONY: help start stop logs portal admin fe-portal fe-admin build test test-portal test-admin images clean db-reset db-logs

# ── Default ────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  myIU Portal — Available commands"
	@echo "  ──────────────────────────────────────────"
	@echo "  make start        Start DB only (local dev)"
	@echo "  make stop         Stop all local containers"
	@echo "  make logs         Tail all container logs"
	@echo "  make build        Build both backend JARs"
	@echo "  make test         Run all backend tests"
	@echo "  make portal       Start portal backend (local profile)"
	@echo "  make admin        Start admin backend (local profile)"
	@echo "  make fe-portal    Start portal frontend dev server"
	@echo "  make fe-admin     Start admin frontend dev server"
	@echo "  make images       Build Docker images"
	@echo "  make clean        Clean build artifacts"
	@echo ""

# ── Local DB ───────────────────────────────────────────────────
start:
	docker compose -f docker-compose.local.yml up -d
	@echo "PostgreSQL started: localhost:5432/myiu_local"

stop:
	docker compose -f docker-compose.local.yml down

logs:
	docker compose -f docker-compose.local.yml logs -f

# ── Backend (run on host for hot reload) ──────────────────────
portal:
	cd backend && SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

admin:
	cd ../myIU-admin/backend && SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

# Windows alternative (Git Bash):
#   cd backend && SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

# ── Frontend ───────────────────────────────────────────────────
fe-portal:
	cd frontend && npm run dev

fe-admin:
	cd ../myIU-admin/frontend && npm run dev

# ── Build ──────────────────────────────────────────────────────
build:
	cd backend && ./mvnw package -DskipTests -q
	cd ../myIU-admin/backend && ./mvnw package -DskipTests -q
	@echo "Build complete"

# ── Test ───────────────────────────────────────────────────────
test:
	cd backend && ./mvnw test -Dspring.profiles.active=test
	cd ../myIU-admin/backend && ./mvnw test -Dspring.profiles.active=test

test-portal:
	cd backend && ./mvnw test -Dspring.profiles.active=test

test-admin:
	cd ../myIU-admin/backend && ./mvnw test -Dspring.profiles.active=test

# ── Docker images ──────────────────────────────────────────────
images:
	docker build -t myiu-portal-backend:local backend/
	docker build -t myiu-admin-backend:local ../myIU-admin/backend/
	docker build --build-arg VITE_API_URL=http://localhost:8080 -t myiu-portal-frontend:local frontend/
	docker build --build-arg VITE_API_URL=http://localhost:8081 -t myiu-admin-frontend:local ../myIU-admin/frontend/

# ── Clean ──────────────────────────────────────────────────────
clean:
	cd backend && ./mvnw clean -q
	cd ../myIU-admin/backend && ./mvnw clean -q
	cd frontend && rm -rf dist node_modules
	cd ../myIU-admin/frontend && rm -rf dist node_modules

# ── DB helpers ─────────────────────────────────────────────────
db-reset:
	docker compose -f docker-compose.local.yml down -v
	docker compose -f docker-compose.local.yml up -d
	@echo "Local DB reset. Run portal to re-run Flyway migrations."

db-logs:
	docker compose -f docker-compose.local.yml logs -f postgres
