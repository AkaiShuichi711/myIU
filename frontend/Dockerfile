# ── Portal Frontend — multi-stage Dockerfile ─────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Cache node_modules layer separately from source
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

COPY . .

# VITE_API_URL is injected at BUILD TIME via --build-arg
# Different URL per environment → different image per env (correct approach)
ARG VITE_API_URL
ARG VITE_APP_ENV=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

RUN npm run build

# ── Runtime: Nginx serving static files ───────────────────────────
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
