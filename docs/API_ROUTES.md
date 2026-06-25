# API Routes Reference

Base URL: `http://localhost:8080`  
Frontend proxy: `/api/*` → `http://localhost:8080/api/*` (via Vite)

---

## Authentication

### User Auth (Microsoft OAuth2)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/oauth2/authorization/microsoft` | Public | Initiates Microsoft SSO flow |
| GET | `/login/oauth2/code/microsoft` | Public | Azure AD callback (handled by Spring Security) |
| GET | `/api/auth/me` | Bearer JWT | Get current user info |

**GET /api/auth/me**
```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <user_jwt>"
```
Response:
```json
{
  "data": {
    "id": "uuid",
    "name": "Nguyen Van A",
    "email": "student@iu.edu.vn",
    "username": "student",
    "roles": ["ROLE_student"],
    "imageUrl": null,
    "bio": null
  }
}
```

---

### Admin Auth (Email/Password)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/auth/setup` | Public (first time only) | Create the first admin account |
| POST | `/api/admin/auth/login` | Public | Admin login |
| GET | `/api/admin/auth/me` | Admin Bearer JWT | Get current admin info |

**POST /api/admin/auth/setup** *(run once — fails if any admin exists)*
```bash
curl -X POST http://localhost:8080/api/admin/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Super Admin","email":"admin@iu.edu.vn","password":"Admin@123"}'
```

**POST /api/admin/auth/login**
```bash
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iu.edu.vn","password":"Admin@123"}'
```
Response:
```json
{
  "token": "<admin_jwt>",
  "id": "uuid",
  "name": "Super Admin",
  "email": "admin@iu.edu.vn",
  "role": "SUPER_ADMIN"
}
```

---

### Admin: User Provisioning

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/provision/upload` | Admin Bearer JWT | Upload Excel to provision users |

**POST /api/admin/provision/upload**
```bash
curl -X POST http://localhost:8080/api/admin/provision/upload \
  -H "Authorization: Bearer <admin_jwt>" \
  -F "file=@provision.xlsx"
```
Response:
```json
{
  "createAttempted": 5,
  "createSucceeded": 4,
  "createSkipped": 1,
  "createLimitHit": false,
  "deleteAttempted": 2,
  "deleteSucceeded": 2,
  "deleteSkipped": 0,
  "deleteLimitHit": false,
  "created": ["student1@iu.edu.vn", "student2@iu.edu.vn"],
  "deactivated": ["old@iu.edu.vn"],
  "errors": []
}
```

---

## Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Bearer JWT | List all users |
| GET | `/api/users/:id` | Bearer JWT | Get user by ID |
| PUT | `/api/users/:id` | Bearer JWT | Update own profile |
| GET | `/api/users/:id/posts` | Bearer JWT | Get user's posts |

---

## Courses

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/courses` | Bearer JWT | List all courses |
| POST | `/api/courses` | Bearer JWT (lecturer) | Create course |
| GET | `/api/courses/:id` | Bearer JWT | Get course detail |
| PUT | `/api/courses/:id` | Bearer JWT | Update course |
| DELETE | `/api/courses/:id` | Bearer JWT | Delete course |
| GET | `/api/courses/:id/posts` | Bearer JWT | Course announcements |
| POST | `/api/courses/:id/posts` | Bearer JWT | Create announcement |

---

## Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | Bearer JWT | Feed posts |
| POST | `/api/posts` | Bearer JWT | Create post |
| GET | `/api/posts/:id` | Bearer JWT | Post detail |
| PUT | `/api/posts/:id` | Bearer JWT | Edit post |
| DELETE | `/api/posts/:id` | Bearer JWT | Delete post |
| POST | `/api/posts/:id/like` | Bearer JWT | Toggle like |
| POST | `/api/posts/:id/save` | Bearer JWT | Toggle save |
| GET | `/api/posts/:id/comments` | Bearer JWT | Get comments |
| POST | `/api/posts/:id/comments` | Bearer JWT | Add comment |

---

## Forms

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/forms/templates` | Bearer JWT | List form templates |
| POST | `/api/forms/submit` | Bearer JWT | Submit a form |
| GET | `/api/forms/submissions` | Bearer JWT | User's submissions |
| GET | `/api/forms/submissions/:id` | Bearer JWT | Submission detail |

---

## Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Bearer JWT | User's notifications |
| PATCH | `/api/notifications/:id/read` | Bearer JWT | Mark as read |
| PATCH | `/api/notifications/read-all` | Bearer JWT | Mark all as read |

---

## File Storage

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/storage/upload` | Bearer JWT | Upload file |
| GET | `/api/storage/:id` | Public | Serve file |
| DELETE | `/api/storage/:id` | Bearer JWT | Delete file |

---

## Login Sessions

Cho phép user xem và thu hồi các phiên đăng nhập (Meta-style "Where you're logged in").

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/sessions` | Bearer JWT | Danh sách tất cả sessions của user hiện tại |
| DELETE | `/api/sessions/{id}` | Bearer JWT | Thu hồi một session cụ thể |
| DELETE | `/api/sessions` | Bearer JWT | Thu hồi tất cả sessions khác (giữ session hiện tại) |

**GET /api/sessions**
```bash
curl http://localhost:8080/api/sessions \
  -H "Authorization: Bearer <jwt>"
```
Response:
```json
[
  {
    "id": "uuid",
    "ipAddress": "123.45.67.89",
    "country": "Vietnam",
    "city": "Ho Chi Minh City",
    "countryCode": "VN",
    "browser": "Chrome",
    "browserVersion": "125.0",
    "os": "Windows 11",
    "deviceType": "desktop",
    "lastActive": "2026-06-25T10:30:00Z",
    "createdAt": "2026-06-25T08:00:00Z",
    "current": true
  }
]
```

`current: true` — session tương ứng với JWT đang dùng để gọi request.  
`country`/`city` có thể là `"Resolving"` trong vài giây đầu sau login (async GeoIP enrichment chưa xong).

**DELETE /api/sessions/{id}** — thu hồi session cụ thể
```bash
curl -X DELETE http://localhost:8080/api/sessions/uuid-of-session \
  -H "Authorization: Bearer <jwt>"
```
Response: `204 No Content`

Không thể thu hồi session hiện tại của chính mình qua endpoint này — dùng `DELETE /api/sessions` để log out tất cả _other_ sessions.

**DELETE /api/sessions** — log out tất cả thiết bị khác
```bash
curl -X DELETE http://localhost:8080/api/sessions \
  -H "Authorization: Bearer <jwt>"
```
Response:
```json
{ "revokedCount": 3 }
```

Giữ nguyên session hiện tại. Các session bị thu hồi sẽ nhận `401` trên request tiếp theo và frontend auto-redirect về `/sign-in?reason=session_expired`.

---

## Observability (Actuator)

Chỉ dùng nội bộ / monitoring. Không expose ra internet trên production.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/actuator/health` | Bearer JWT | Liveness check — `{"status":"UP"}` |
| GET | `/actuator/metrics` | Bearer JWT | Danh sách tất cả metric names |
| GET | `/actuator/metrics/{name}` | Bearer JWT | Chi tiết một metric |
| GET | `/actuator/prometheus` | Bearer JWT | Prometheus scrape endpoint |
| GET | `/actuator/info` | Bearer JWT | App info (version, build time) |

**GET /actuator/health**
```bash
curl http://localhost:8080/actuator/health \
  -H "Authorization: Bearer <jwt>"
```
Response:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

**Metrics quan trọng:**

| Metric | Ý nghĩa |
|---|---|
| `http.server.requests` | Request latency, p95/p99 |
| `hikaricp.connections.active` | DB connection pool đang dùng |
| `hikaricp.connections.pending` | Request đang chờ connection |
| `jvm.memory.used` | Heap / non-heap usage |
| `jvm.threads.live` | Virtual thread count |
| `process.cpu.usage` | CPU usage |

```bash
# Xem latency của /api/sessions
curl "http://localhost:8080/actuator/metrics/http.server.requests?tag=uri:/api/sessions" \
  -H "Authorization: Bearer <jwt>"
```

---

## API Documentation (Swagger)

Chỉ khả dụng trên `local` và `dev`. Bị tắt trên `prod`.

| Path | Description |
|---|---|
| `/swagger-ui.html` | Swagger UI (interactive) |
| `/api-docs` | OpenAPI JSON schema |
| `/api-docs.yaml` | OpenAPI YAML schema |

---

## Rate Limiting

Khi vượt giới hạn, server trả `429 Too Many Requests`:

```json
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-Rate-Limit-Remaining: 0

{ "message": "Too many requests. Please wait 45 seconds." }
```

| Endpoint | Giới hạn |
|---|---|
| `/oauth2/authorization/microsoft` | 5 request/phút/IP |
| `/api/*/search` | 60 request/phút/IP |
| `POST /api/*/upload` | 10 request/giờ/IP |
| `/api/**` (chung) | 120 request/phút/IP |

---

## Error Codes

| Code | Meaning |
|---|---|
| 401 | Not authenticated / invalid token |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 405 | Method disabled (e.g. email/password login for users) |
| 409 | Conflict (e.g. admin already exists during setup) |

---

## OAuth2 Error Parameters

After a failed Microsoft login, the frontend receives `?error=<code>`:

| Error Code | Meaning |
|---|---|
| `not_provisioned` | Email not in database — admin must add via Excel |
| `account_inactive` | User was deactivated via Excel Delete sheet |
| `no_email` | Microsoft didn't return an email address |
| `oauth2` | Generic OAuth2 failure |

---

## 401 Auto-logout

Khi frontend nhận `401`, `lib/api/client.ts` tự động:
1. Xóa JWT khỏi localStorage
2. Redirect về `/sign-in?reason=session_expired`

Điều này xảy ra khi session bị thu hồi (từ Settings hoặc từ admin) và user thực hiện request tiếp theo.
