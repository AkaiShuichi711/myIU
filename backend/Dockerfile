# ─────────────────────────────────────────────────────────────────
#  Portal Backend — multi-stage Dockerfile
#  Works on: Windows (Docker Desktop), macOS (Docker Desktop / OrbStack), Linux
#  Base: Eclipse Temurin 21 (official Java 21 LTS by Adoptium)
# ─────────────────────────────────────────────────────────────────

# ── Stage 1: dependency cache ─────────────────────────────────────
# Separate layer for dependencies so they're cached between builds.
# Only invalidated when pom.xml changes — not on every source change.
FROM eclipse-temurin:21-jdk-alpine AS deps
WORKDIR /build
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:resolve -q --no-transfer-progress

# ── Stage 2: build ────────────────────────────────────────────────
FROM deps AS builder
COPY src/ src/
RUN ./mvnw package -DskipTests -q --no-transfer-progress

# ── Stage 3: runtime (minimal JRE — no JDK in prod image) ────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user — security best practice (CIS Benchmark for containers)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/target/*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser
EXPOSE 8080

# JVM flags for containers:
# -XX:+UseContainerSupport     → respects Docker CPU/memory cgroup limits (critical!)
# -XX:MaxRAMPercentage=75.0   → use 75% of container RAM, leave headroom for OS
# -XX:+UseG1GC                → G1GC: low-pause GC, good for server workloads
# -Djava.security.egd         → faster entropy for SecureRandom (login/JWT)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
