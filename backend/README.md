# myIU Portal — Backend

Java 21 · Spring Boot 3.4 · PostgreSQL 16 · Flyway · JWT · Microsoft Azure AD SSO

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java JDK | 21+ |
| Maven | 3.9+ |
| PostgreSQL | 15+ |

---

## Quick Start

### 1. Tạo database

```sql
CREATE DATABASE "myIU_dev";
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
# Mở .env và điền các giá trị thực
```

### 3. Chạy ứng dụng

```bash
cd backend
mvn spring-boot:run
```

API sẽ khởi động tại `http://localhost:8080`.  
Flyway tự động apply migrations khi khởi động lần đầu.

---

## Biến môi trường

| Biến | Bắt buộc | Mặc định | Mô tả |
|------|----------|----------|-------|
| `AZURE_CLIENT_ID` | ✅ | — | Azure App Registration Client ID |
| `AZURE_CLIENT_SECRET` | ✅ | — | Azure App Registration Client Secret |
| `AZURE_TENANT_ID` | ✅ | — | Azure AD Tenant ID |
| `DB_URL` | ✅ | — | JDBC URL PostgreSQL |
| `DB_USERNAME` | ✅ | — | Database username |
| `DB_PASSWORD` | ✅ | — | Database password |
| `JWT_SECRET` | ✅ | — | HMAC-SHA256 secret (≥ 256-bit, hex) |
| `FRONTEND_URL` | — | `http://localhost:5173` | URL frontend (CORS + OAuth2 redirect) |
| `APP_BASE_URL` | — | `http://localhost:8080` | URL backend (OAuth2 redirect URI) |
| `UPLOAD_DIR` | — | `./uploads` | Thư mục lưu file upload |

> Sinh JWT secret: `openssl rand -hex 32`

---

## Azure AD Setup

1. Vào [Azure Portal](https://portal.azure.com) → **App registrations** → New registration
2. **Redirect URI**: `http://localhost:8080/login/oauth2/code/microsoft` (Web)
3. **Certificates & secrets** → New client secret → copy vào `AZURE_CLIENT_SECRET`
4. **Overview** → copy **Application (client) ID** → `AZURE_CLIENT_ID`
5. **Overview** → copy **Directory (tenant) ID** → `AZURE_TENANT_ID`
6. **API permissions**: `openid`, `profile`, `email` (Microsoft Graph, Delegated)

---

## Database Migrations (Flyway)

Migrations nằm trong `src/main/resources/db/`:

```
db/
├── migration/          # Schema — chạy ở mọi môi trường
│   ├── V1__initial_schema.sql
│   ├── V2__admin_users.sql
│   ├── V3__user_provisioning.sql          # cột audit provisionedBy/provisionedAt — feature Excel
│   │                                      #   upload dùng chúng đã bị xóa, cột thì vẫn giữ
│   ├── V4__support_tickets.sql
│   ├── V5__login_sessions.sql
│   ├── V6__course_schedules.sql
│   ├── V8__assignment_submissions.sql
│   ├── V9__attendance_records.sql
│   ├── V11__cascade_user_deletes.sql      # xóa user giờ cascade qua course/grade/... user đó tạo
│   └── V12__login_session_precise_location.sql  # lat/lng/province/district/ward
└── seed/               # Dữ liệu mẫu — chỉ local/dev
    ├── V7__seed_data.sql
    └── V10__seed_data_extended.sql
```

Seed data được kích hoạt bằng profile `local` hoặc `dev`:

```bash
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

> **`out-of-order: true` trong dev profile** — `application-dev.yml` bật `spring.flyway.out-of-order: true` để cho phép re-apply seed migrations (V7, V10) sau khi xóa thủ công `flyway_schema_history`. **Không bật flag này trên prod.**

---

## API Reference

### Auth
| Method | Path | Auth |
|--------|------|------|
| GET | `/oauth2/authorization/microsoft` | Public — starts Microsoft SSO redirect |
| GET | `/api/auth/me` | Bearer |

There is no local email/password registration for the portal — accounts are pre-provisioned by an
admin (in myIU-admin) and log in exclusively via Microsoft SSO. `not_provisioned` is the error code
returned when the SSO email has no matching row in `users`.

### Sessions
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/sessions` | Bearer |
| DELETE | `/api/sessions/{id}` | Bearer |
| DELETE | `/api/sessions/others` | Bearer |
| PUT | `/api/sessions/heartbeat` | Bearer |
| PUT | `/api/sessions/current/location` | Bearer — opt-in GPS enrichment, see docs/API_ROUTES.md |

### Users
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/users/{id}` | Bearer |
| PUT | `/api/users/{id}` | Bearer |
| GET | `/api/users/by-username/{username}` | Bearer |
| GET | `/api/users/search?q=&role=` | Bearer — `role` optional; `role=lecturer` restricts results to lecturers |
| POST | `/api/users/{id}/avatar` | Bearer |

### Posts
| Method | Path |
|--------|------|
| POST | `/api/posts` |
| GET | `/api/posts?page=0&size=10` |
| GET | `/api/posts/{id}` |
| PUT | `/api/posts/{id}` |
| DELETE | `/api/posts/{id}` |
| POST | `/api/posts/{id}/like` |
| POST | `/api/posts/{id}/save` |
| GET | `/api/posts/saved` |

### Courses & Academic
| Method | Path | Mô tả |
|--------|------|-------|
| GET/POST | `/api/courses` | Danh sách / tạo khóa học |
| GET/PUT/DELETE | `/api/courses/{id}` | Chi tiết / sửa / xóa |
| GET/POST | `/api/course-groups` | Nhóm học |
| GET | `/api/course-groups/lecturer/{id}/courses` | Khóa học của giảng viên |
| GET/POST/DELETE | `/api/group-members` | Thành viên nhóm |
| GET | `/api/group-members/student/{id}/courses` | Khóa học của sinh viên |
| GET/POST | `/api/course-posts` | Bài đăng trong khóa học |
| GET/POST | `/api/grades` | Bảng điểm |

### Timetable / Course Schedules
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/timetable` | Lịch học cá nhân (student/lecturer) |
| GET | `/api/courses/{courseId}/schedules` | Lịch học của một course |
| POST | `/api/courses/{courseId}/schedules` | Thêm buổi học (lecturer only) |
| DELETE | `/api/course-schedules/{scheduleId}` | Xóa buổi học (lecturer only) |

### Attendance & Submissions
| Method | Path |
|--------|------|
| GET/POST/PUT | `/api/attendance` |
| GET/POST | `/api/submissions` |

### Forms
| Method | Path |
|--------|------|
| GET | `/api/forms/templates` |
| POST | `/api/forms/submit` |
| GET/PUT | `/api/forms/submissions/{id}` |

### Storage
| Method | Path |
|--------|------|
| POST | `/api/storage/upload` |
| GET | `/api/storage/files/{filename}` (Public) |

### Notifications & Social
| Method | Path |
|--------|------|
| GET | `/api/notifications` |
| PATCH | `/api/notifications/{id}/read` |
| GET/POST | `/api/comments` |
| POST | `/api/blocks` |

---

## Kiến trúc bảo mật

- **Session**: STATELESS — không tạo `HttpSession`
- **Token**: JWT (HMAC-SHA256), 24h expiry, blacklist in-memory khi logout
- **Session revocation**: Bảng `login_sessions` với cột `is_revoked`
- **OAuth2**: Microsoft Azure AD (Authorization Code Flow), cookie-based state
- **Email normalization**: Microsoft có thể trả về email dạng HOA (`ITITIU21354@...`). `OAuth2SuccessHandler` và `UserDetailsServiceImpl` đều gọi `.toLowerCase()` trước khi lookup. **Không xóa bước này.**
- **CORS**: Configured via `app.cors.allowed-origins`
- **Client IP trust**: `IpUtils.extractIp()` chỉ tin `X-Forwarded-For`/`X-Real-IP` khi peer TCP trực tiếp (`getRemoteAddr()`, client không giả được) là địa chỉ private/loopback — tức request thật sự đi qua reverse proxy của chính mình. Nếu không, dùng đúng `getRemoteAddr()`, bỏ qua header. Bảo vệ rate-limit login (5/phút/IP) khỏi bị bypass bằng cách giả `X-Forwarded-For` mỗi request.

---

## Swagger UI

Sau khi chạy: `http://localhost:8080/swagger-ui.html`

---

## Lưu ý quan trọng cho developer

### `open-in-view: false` + `@Transactional`
`spring.jpa.open-in-view: false` được bật toàn cục. Hibernate session **đóng ngay sau khi repository call kết thúc**. Bất kỳ service method nào truy cập LAZY relation (ví dụ `user.getRoles()`) ngoài phạm vi repository call đều sẽ ném `LazyInitializationException`.

**Luôn thêm `@Transactional(readOnly = true)` vào service method** mà truy xuất entity có quan hệ LAZY.

### `user_roles` table — JPQL JOIN
Roles được lưu qua `@ElementCollection` trong bảng `user_roles`. JPQL thông thường không thể filter trực tiếp — phải dùng JOIN:

```java
// Đúng
@Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role AND ...")
List<User> searchByRole(@Param("q") String q, @Param("role") String role);
```

Roles lưu **không có prefix** `ROLE_` (ví dụ: `student`, `lecturer`). `UserDetailsServiceImpl` tự thêm prefix khi tạo `GrantedAuthority`.

### File storage
Tất cả file (form template, submission) được serve từ **portal backend** tại `/api/storage/files/{filename}`. Admin backend cũng tạo URL theo format này để portal user có thể download. Không tạo file-serving endpoint riêng ở admin.

### `@Modifying` query cần `@Transactional` ngay trên method gọi nó — kể cả (nhất là) từ `@Async`
Spring Data **không** tự bọc transaction cho custom `@Query`+`@Modifying` như nó làm với `save()`/`findById()`. `GeoIpService.lookupAndEnrich()` chạy `@Async` trên thread pool riêng (không kế thừa transaction nào), gọi `sessionRepo.updateGeoLocation(...)` mà thiếu `@Transactional` → mọi lần đều ném `TransactionRequiredException`, bị catch âm thầm và log ở mức DEBUG. Hệ quả: **mọi session đăng nhập bị kẹt `country="Resolving"` vĩnh viễn**, hàng tuần liền, không 1 lỗi nào hiện ra. Chỉ phát hiện được khi query thẳng vào DB. Bài học: thêm `@Transactional` **ngay trên method `@Async`**, không phải ở nơi gọi nó.

### Xóa user giờ cascade — đây là chủ đích, không phải bug
`courses.creator_id`, `course_groups.lecturer_id`, `course_posts.author_id`, `course_grades.graded_by`, `form_templates.created_by` đều `ON DELETE CASCADE` (từ V11). Xóa 1 giảng viên sẽ xóa luôn khóa học họ tạo, kéo theo điểm số/bài nộp/điểm danh của **sinh viên khác** trong khóa đó. Nếu cần xóa "an toàn" không ảnh hưởng người khác, dùng `is_active = false` (deactivate) thay vì xóa.
