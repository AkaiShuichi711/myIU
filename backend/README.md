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
| `PROVISION_MAX_CREATE` | — | `200` | Số tài khoản tối đa tạo mỗi lần upload Excel |
| `PROVISION_MAX_DELETE` | — | `100` | Số tài khoản tối đa xóa mỗi lần upload Excel |

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
│   ├── V2__sso_columns.sql
│   ├── V3__login_sessions.sql
│   ├── V4__timetable_attendance.sql
│   └── ...
└── seed/               # Dữ liệu mẫu — chỉ local/dev
    ├── V7__seed_base.sql
    └── V10__seed_extended.sql
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
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Bearer |
| GET | `/api/auth/me` | Bearer |
| GET | `/api/auth/sessions` | Bearer |
| DELETE | `/api/auth/sessions/{id}` | Bearer |

### Users
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/users/{id}` | Bearer |
| PUT | `/api/users/{id}` | Bearer |
| GET | `/api/users/by-username/{username}` | Bearer |
| GET | `/api/users/search?q=&role=` | Bearer — `role` optional; `role=lecturer` restricts results to lecturers |
| POST | `/api/users/{id}/avatar` | Bearer |
| POST | `/api/users/provision` | Bearer (Admin) |

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
