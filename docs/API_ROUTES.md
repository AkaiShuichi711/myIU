# API Routes Reference

Base URL: `http://localhost:8080`  
All `/api/*` routes require `Authorization: Bearer <jwt>` unless noted as Public.

---

## Authentication

### User Auth (Microsoft OAuth2)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/oauth2/authorization/microsoft` | Public | Initiates Microsoft SSO flow |
| GET | `/login/oauth2/code/microsoft` | Public | Azure AD callback (Spring Security) |
| GET | `/api/auth/me` | Bearer JWT | Get current user info |

**GET /api/auth/me**
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

---

## Admin Panel

All endpoints below require `Admin Bearer JWT` (`hasRole('admin')`).

### Stats

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform stats: total users, courses, tickets |

```json
{ "data": { "users": 1240, "courses": 87, "tickets": 14 } }
```

### User Management

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users (optional `?q=` search by name/email) |
| PUT | `/api/admin/users/{id}/status` | Activate or deactivate a user |

**PUT /api/admin/users/{id}/status**
```json
{ "active": false }
```

### Support Ticket Management

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/tickets` | List all tickets (optional `?status=open\|in_progress\|resolved`) |
| PUT | `/api/admin/tickets/{id}` | Respond to a ticket |

**PUT /api/admin/tickets/{id}**
```json
{ "response": "Your request has been processed.", "status": "resolved" }
```

### User Provisioning

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/provision` | Upload Excel to bulk create/deactivate users (field: `file`) |

Response:
```json
{
  "data": {
    "createAttempted": 5, "createSucceeded": 4, "createSkipped": 1, "createLimitHit": false,
    "deleteAttempted": 2, "deleteSucceeded": 2, "deleteSkipped": 0, "deleteLimitHit": false,
    "created": ["student1@iu.edu.vn"],
    "deactivated": ["old@iu.edu.vn"],
    "errors": []
  }
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
| GET | `/api/courses/:id/posts` | Bearer JWT | Course posts |
| POST | `/api/courses/:id/posts` | Bearer JWT | Create course post |

---

## Course Groups & Members

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/courses/:id/groups` | Bearer JWT | List groups for a course |
| POST | `/api/courses/:id/groups` | Bearer JWT | Create group |
| PUT | `/api/groups/:id` | Bearer JWT | Update group |
| DELETE | `/api/groups/:id` | Bearer JWT | Delete group |
| GET | `/api/groups/:id/members` | Bearer JWT | List group members |
| POST | `/api/groups/:id/members` | Bearer JWT | Add member |
| DELETE | `/api/groups/:id/members/:userId` | Bearer JWT | Remove member |
| GET | `/api/group-members?courseId=` | Bearer JWT | All members across all groups for a course |

---

## Assignment Submissions

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/submissions` | Bearer JWT (student) | Submit or resubmit an assignment |
| GET | `/api/submissions?coursePostId=` | Bearer JWT (lecturer) | All submissions for an assignment post |
| GET | `/api/submissions/mine?coursePostId=` | Bearer JWT (student) | Own submission (null if not submitted) |
| PUT | `/api/submissions/:id/grade` | Bearer JWT (lecturer) | Grade a submission |

**POST /api/submissions** (student submit)
```json
{
  "coursePostId": "uuid",
  "fileUrl": "https://...",
  "fileId": "uuid",
  "fileName": "report.pdf",
  "textContent": "Optional written answer"
}
```
Status is automatically set to `LATE` if submitted after `coursePost.dueDate`.
Will not downgrade an already-`GRADED` submission back to `SUBMITTED`.

**PUT /api/submissions/:id/grade** (lecturer grade)
```json
{
  "score": 8.5,
  "feedback": "Good work, minor issues with citations."
}
```
Sets status to `GRADED`.

Submission statuses: `SUBMITTED` | `LATE` | `GRADED`

---

## Attendance

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/attendance?courseId=&date=&studentId=` | Bearer JWT (lecturer) | Query attendance records |
| GET | `/api/attendance/mine?courseId=` | Bearer JWT (student) | Own attendance history for a course |
| POST | `/api/attendance` | Bearer JWT (lecturer) | Create or update a single attendance record |
| POST | `/api/attendance/bulk` | Bearer JWT (lecturer) | Bulk upsert attendance for a class session |
| DELETE | `/api/attendance/:id` | Bearer JWT (lecturer) | Delete an attendance record |

**POST /api/attendance** (single record)
```json
{
  "courseId": "uuid",
  "studentId": "uuid",
  "studentName": "Nguyen Van A",
  "date": "2026-08-03",
  "status": "PRESENT",
  "note": ""
}
```

**POST /api/attendance/bulk** (whole class for one session)
```json
{
  "courseId": "uuid",
  "date": "2026-08-03",
  "records": [
    { "studentId": "uuid", "studentName": "...", "status": "PRESENT" },
    { "studentId": "uuid", "studentName": "...", "status": "ABSENT" }
  ]
}
```

Attendance statuses: `PRESENT` | `ABSENT` | `LATE` | `EXCUSED`

---

## Grades

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/courses/:id/grades` | Bearer JWT | Get grades for a course |
| POST | `/api/courses/:id/grades` | Bearer JWT (lecturer) | Create/update grade |
| GET | `/api/grades/me` | Bearer JWT | Get own grades (all courses) |

---

## Timetable

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/timetable` | Bearer JWT | Get current user's timetable |
| GET | `/api/timetable/course/:courseId` | Bearer JWT | Get schedule for a course |
| POST | `/api/timetable` | Bearer JWT (lecturer/admin) | Add course schedule entry |
| PUT | `/api/timetable/:id` | Bearer JWT | Update schedule entry |
| DELETE | `/api/timetable/:id` | Bearer JWT | Delete schedule entry |

CourseSchedule fields: `courseId`, `dayOfWeek` (MON–SUN), `startTime`, `endTime`, `room`, `type` (lecture/lab/tutorial).

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

### Templates

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/forms/templates` | Bearer JWT | List all form templates |
| POST | `/api/forms/templates` | Admin JWT | Create form template |
| PUT | `/api/forms/templates/:id` | Admin JWT | Update template |
| DELETE | `/api/forms/templates/:id` | Admin JWT | Delete template |

### Submissions

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/forms/submit` | Bearer JWT | Submit a form |
| GET | `/api/forms/submissions` | Bearer JWT | User's own submissions |
| GET | `/api/forms/submissions/review` | Bearer JWT | Submissions pending my review |
| GET | `/api/forms/submissions/:id` | Bearer JWT | Submission detail |
| PATCH | `/api/forms/submissions/:id` | Bearer JWT | Update status (approve/reject) |

**PATCH /api/forms/submissions/:id** — approve or reject:
```json
{ "status": "approved" }
```
or:
```json
{
  "status": "rejected",
  "rejectionReason": "Thiếu chữ ký giáo viên chủ nhiệm"
}
```

On status change to `approved` or `rejected`, the backend asynchronously sends an HTML email to the submitter's email address (if SMTP is configured).

Submission statuses: `pending` | `approved` | `rejected`

---

## Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Bearer JWT | User's notifications |
| PATCH | `/api/notifications/:id/read` | Bearer JWT | Mark as read |
| PATCH | `/api/notifications/read-all` | Bearer JWT | Mark all as read |

---

## Support Tickets

### User-facing

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/support` | Bearer JWT | List user's own support tickets |
| POST | `/api/support` | Bearer JWT | Submit new support ticket |
| GET | `/api/support/:id` | Bearer JWT | Ticket detail |

### Admin-facing

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/tickets` | Admin JWT | All tickets (optional `?status=`) |
| PUT | `/api/admin/tickets/:id` | Admin JWT | Respond to ticket |

Ticket statuses: `open` | `in_progress` | `resolved`

---

## File Storage

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/storage/upload` | Bearer JWT | Upload file (max 20MB) |
| GET | `/api/storage/:id` | Public | Serve file |
| DELETE | `/api/storage/:id` | Bearer JWT | Delete file |

---

## Login Sessions

Meta-style "Where you're logged in" — view and revoke sessions.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/sessions` | Bearer JWT | List all sessions for current user |
| DELETE | `/api/sessions/:id` | Bearer JWT | Revoke a specific session |
| DELETE | `/api/sessions` | Bearer JWT | Revoke all other sessions |

**GET /api/sessions** response:
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
    "lastActive": "2026-07-05T10:30:00Z",
    "createdAt": "2026-07-05T08:00:00Z",
    "current": true
  }
]
```

`current: true` = session used to make this request.
`country`/`city` may be `"Resolving"` for a few seconds after login (async GeoIP).

**DELETE /api/sessions** — revoke all other sessions:
```json
{ "revokedCount": 3 }
```

Revoked sessions receive `401` on next request → frontend auto-redirects to `/sign-in?reason=session_expired`.

---

## WebSocket (Real-time Notifications)

Endpoint: `ws://localhost:8080/ws` (SockJS fallback supported)

**Connect (STOMP):**
```
CONNECT
Authorization: Bearer <jwt>
```

**Subscribe:**
```
SUBSCRIBE /topic/notifications/{userId}
```

**Message format:**
```json
{
  "id": "uuid",
  "type": "form_approved",
  "message": "Đơn của bạn đã được duyệt",
  "linkTo": "/forms",
  "read": false,
  "createdAt": "2026-07-05T10:30:00Z"
}
```

Notification types: `form_approved` | `form_rejected` | `form_pending` | `grade` | `course` | `system`

---

## Observability (Actuator)

Internal use only — do not expose on production internet.

| Method | Path | Description |
|---|---|---|
| GET | `/actuator/health` | Liveness check → `{"status":"UP"}` |
| GET | `/actuator/metrics` | List all metric names |
| GET | `/actuator/metrics/{name}` | Metric detail |
| GET | `/actuator/prometheus` | Prometheus scrape endpoint |
| GET | `/actuator/info` | App info (version, build time) |

Key metrics:

| Metric | Meaning |
|---|---|
| `http.server.requests` | Request latency p95/p99 |
| `hikaricp.connections.active` | DB connection pool in use |
| `hikaricp.connections.pending` | Requests waiting for connection |
| `jvm.memory.used` | Heap / non-heap usage |
| `jvm.threads.live` | Virtual thread count |

---

## API Documentation (Swagger)

Available on `local` and `dev` only. Disabled on `prod`.

| Path | Description |
|---|---|
| `/swagger-ui.html` | Swagger UI (interactive) |
| `/api-docs` | OpenAPI JSON |
| `/api-docs.yaml` | OpenAPI YAML |

---

## Rate Limiting

When exceeded, server returns `429 Too Many Requests`:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
{ "message": "Too many requests. Please wait 45 seconds." }
```

| Endpoint | Limit |
|---|---|
| `/oauth2/authorization/microsoft` | 5 req/min/IP |
| `/api/*/search` | 60 req/min/IP |
| `POST /api/*/upload` | 10 req/hr/IP |
| `/api/**` (general) | 120 req/min/IP |

---

## Error Codes

| Code | Meaning |
|---|---|
| 401 | Not authenticated / token invalid or session revoked |
| 403 | Authenticated but not authorized (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. admin already exists during setup) |
| 429 | Too many requests (rate limit hit) |

---

## OAuth2 Error Parameters

After a failed Microsoft login, the frontend receives `?error=<code>`:

| Error Code | Meaning |
|---|---|
| `not_provisioned` | Email not in database — admin must add via Excel |
| `account_inactive` | User was deactivated via Excel Delete sheet |
| `no_email` | Microsoft didn't return an email address |
| `oauth2` | Generic OAuth2 failure |
