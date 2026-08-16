# myIU: Design and Implementation of an Integrated University Student Portal with Federated Identity Authentication and Dual-Interface Management Architecture

*(Thiết kế và triển khai hệ thống cổng thông tin sinh viên tích hợp với xác thực danh tính liên kết và kiến trúc quản trị hai giao diện)*

> Dàn ý này đã đối chiếu từng dòng với codebase thật (`myIU` + `myIU-admin`) tính đến thời điểm hiện tại. Những chỗ đánh dấu **[MỚI]** là nội dung chưa có trong bản draft gốc — toàn bộ đã có sẵn văn bản chi tiết ở `docs/thesis.html` mục 5.5–5.8, chỉ cần đưa vào đúng vị trí trong khung chương này.

---

## Chương 1 — INTRODUCTION

**1.1 Background** — Thực trạng quản lý học vụ phân tán tại các trường đại học Việt Nam.

**1.2 Problem Statement** — Thiếu nền tảng thống nhất cho sinh viên, giảng viên, quản trị viên.

**1.3 Scope and Objectives**
- Phạm vi: Portal (sinh viên + giảng viên) + Admin Panel (quản trị viên), 2 ứng dụng độc lập
- Mục tiêu: SSO Microsoft, quản lý khóa học, thời khóa biểu, điểm số, điểm danh, bài tập, mạng xã hội học thuật, đơn từ hành chính, **theo dõi phiên đăng nhập với định vị vị trí [MỚI]**

**1.4 Assumptions and Solution** — Giả định tổ chức dùng Microsoft 365/Azure AD. Giải pháp: 2 backend độc lập (portal :8080, admin :8081) chia sẻ PostgreSQL, schema do Flyway của portal sở hữu.

**1.5 Structure of the Thesis**

---

## Chương 2 — LITERATURE REVIEW

**2.1 Theoretical Foundations** — SPA, OAuth2/OIDC & Federated Identity, JWT stateless session, RBAC, RESTful API design, migration-as-code (Flyway).

**2.2 Moodle** — Ưu điểm / hạn chế (nặng, khó customize, UI lỗi thời).

**2.3 Canvas LMS** — Ưu điểm / hạn chế (cloud-only, chi phí cao).

**2.4 Blackboard Learn** — Ưu điểm / hạn chế (enterprise, over-engineered cho trường vừa/nhỏ).

**2.5 Microsoft Teams for Education** — Ưu điểm / hạn chế (phụ thuộc hệ sinh thái Microsoft, thiếu tính năng học vụ đặc thù).

**2.6 Cổng thông tin sinh viên tại đại học Việt Nam** (HCMUT, UEH, UIT) — Ưu điểm / hạn chế (UI cũ, không app mobile, không SSO hiện đại).

**2.7 Gap Identification and Proposed Enhancements** — Khoảng trống: tích hợp SSO doanh nghiệp, social feed học thuật, admin panel tách biệt, real-time notification (WebSocket push thật, không phải polling). myIU giải quyết cả 4.

**2.8 Summary**

---

## Chương 3 — METHODOLOGY

**3.1 Overview**

**3.2 Architecture Overview and Design Rationale**
- Design Rationale: Spring Boot 3.4.1 + Java 21 (virtual threads, records), React + Vite, PostgreSQL 16
- Layered Architecture: Controller → Service → Repository → Entity
- Dual-System Architecture: Portal sở hữu schema (**Flyway V1–V12**), Admin dùng `ddl-auto: none`
- **[MỚI] Iterative refinement as an architectural decision**: phát hiện tính năng cung ứng người dùng hàng loạt qua Excel là dead code ở Portal backend (không controller nào gọi tới) qua audit toàn bộ codebase; quyết định gỡ bỏ hoàn toàn ở cả 2 backend thay vì chỉ dọn phần chết, giảm bề mặt tấn công và dependency không cần thiết (Apache POI)

**3.3 Database Design** — 5 nhóm domain:
- Identity & Access: `users`, `admin_users`, `login_sessions` (**+ latitude/longitude/province/district/ward [MỚI]**)
- Academic Core: `courses`, `course_groups`, `group_members`, `course_schedules`
- Assessment & Progress: `course_posts`, `assignment_submissions`, `attendance_records`, `course_grades`
- Communication & Social: `posts`, `post_tags`, `comments`, `notifications`
- Administrative Services: `form_templates`, `form_submissions`, `support_tickets`
- **[MỚI] Referential integrity policy**: phân loại 7 khóa ngoại tham chiếu `users(id)` thành 2 nhóm bản chất khác nhau — dữ liệu sở hữu riêng (cascade an toàn) vs. nội dung người khác phụ thuộc vào (cascade ảnh hưởng người khác); chọn cascade toàn bộ có chủ đích cho ngữ cảnh dữ liệu hiện tại (migration V11)

**3.4 Class Diagram Design** — Entity, Repository (Spring Data JPA), Service, DTO projection, Controller.

**3.5 Use Case Analysis**
- Actors: Student, Lecturer, Admin
- Use Case Groups: Authentication, Course Management, Timetable, Grade Lookup, Attendance, Assignment Submission, Social Feed, Form Submission, Admin Dashboard, **Session Monitoring with Location [MỚI]**
- Critical Flows: SSO OAuth2 callback → JWT issuance; Flyway migration sequence; lazy-load transaction boundary (OSIV disabled)

**3.6 Authentication and Authorization Architecture**
- Microsoft Azure AD OAuth2/OIDC, Spring Security filter chain, JWT generation/validation, role mapping (`ROLE_student`/`ROLE_lecturer`), CORS policy cho dual-origin (:5173, :3000)
- **[MỚI] 3.6.x Client IP Trust Boundary**: vì sao không thể tin `X-Forwarded-For`/`X-Real-IP` vô điều kiện — header này nuôi cả rate-limiter chống brute-force lẫn audit log vị trí đăng nhập, hoàn toàn có thể giả mạo bởi client; giải pháp xác định "trusted proxy" dựa trên peer TCP thật (`getRemoteAddr()`) thay vì tin header

**3.7 Federated Identity, Session Management, and Precise Geolocation** *(đổi tên từ "Federated Identity and Session Management" để phản ánh đúng phạm vi)*
- Không lưu password, JWT stateless, secret riêng biệt giữa 2 backend
- **[MỚI]** Sau đăng nhập, luồng opt-in: xin quyền GPS trình duyệt một lần → nếu đồng ý, reverse-geocode qua OpenStreetMap Nominatim xuống tới phường/quận/tỉnh; so sánh với giới hạn vật lý của định vị theo IP (chỉ tới cấp thành phố, không bao giờ xuống được quận/phường dù dùng dịch vụ trả phí)

**3.8 Real-Time Notification System** *(sửa lại cho đúng — đây là WebSocket push thật, không phải polling)*
- Kiến trúc: `NotificationService.push()` → STOMP broker `/topic/notifications/{userId}` → `useNotificationSocket.ts` (SockJS) nhận real-time
- `WebSocketAuthInterceptor` xác thực JWT ngay tại STOMP CONNECT frame
- Trigger: nộp bài, chấm điểm, duyệt/từ chối đơn, broadcast từ admin

**3.9 Data Migration Strategy with Flyway**
- `db/migration/` (**V1–V12**, schema mọi môi trường) + `db/seed/` (V7, V10, chỉ local/dev)
- UUID qua `gen_random_uuid()`
- **[MỚI]** Ví dụ migration phát sinh từ phát hiện lỗi trong lúc test (V11 cascade-delete, V12 GPS columns) — minh hoạ migration-as-code hỗ trợ phát triển lặp (iterative development) tốt thế nào

**3.10 Multi-Environment Configuration** — 3 profile (local/dev/prod): Flyway seed locations, connection pool, logging level, Swagger visibility.

---

## Chương 4 — IMPLEMENTATION AND RESULTS

**4.1 Backend Implementation**
- Spring Boot 3.4.1 + Java 21, Maven
- Hibernate + Spring Data JPA, `open-in-view: false`, pattern `@Transactional(readOnly = true)`
- Global exception handler, `ApiResponse<T>` wrapper
- File upload, rate limiting, request ID filter

**4.2 Frontend Implementation (Portal)**
- React 18 + Vite + TypeScript, React Query (caching, mutation hooks)
- React Router v6, protected routes theo role
- Trang chính: `TimetablePage`, `CoursesPage`, `GradesPage`, Social Feed, `FormsPage`
- **[MỚI]** `Settings.tsx` — quản lý phiên đăng nhập (revoke), `geoLocation.ts` hook xin quyền GPS fire-and-forget sau login

**4.3 Admin Panel Implementation**
- React + Vite (:3000), độc lập hoàn toàn với Portal frontend
- Quản lý: Users, Courses, Enrollment, Grades, Form Templates, Form Submissions, Support Tickets, Notification Broadcast, **Login Sessions (kèm vị trí GPS nếu có) [MỚI]**
- JWT riêng, Caffeine cache
- **[MỚI]** Xóa user giờ cascade qua toàn bộ nội dung họ sở hữu (V11); lỗi FK violation trả về lý do cụ thể (409) thay vì 500 chung chung; UI đã chỉnh lại theo hướng tối giản (bỏ badge màu pastel kiểu "AI-generated")

**4.4 API Documentation and Testing**
- Swagger UI (`/swagger-ui.html`) local/dev, Springdoc OpenAPI
- Integration test với Testcontainers PostgreSQL thật (không mock DB) — xác nhận qua `ci.yml`

**4.5 Results** — Screenshots: Portal (Trang chủ, Thời khóa biểu, Khóa học, Bảng điểm, Social Feed, Đơn từ, **Settings/Sessions với vị trí GPS**) và Admin (Dashboard, Users, Courses, **Sessions với vị trí**).

---

## Chương 5 — DISCUSSION AND EVALUATION

**5.1 Discussion**
- Tại sao tách Portal/Admin thành 2 backend thay vì monolith; trade-off shared database vs. separate database
- Tại sao stateless JWT thay vì Spring Session
- **[MỚI]** Quyết định gỡ Excel provisioning: bề mặt tấn công vs. lợi ích thực tế của một tính năng ít dùng, một phần là dead code

**5.2 Evaluation**

*Security & Reliability* — Viết cụ thể bằng dẫn chứng thật thay vì mô tả chung chung:
- Federated identity loại bỏ password storage risk; RBAC granular; CORS lockdown theo môi trường
- **[MỚI]** Cascade-delete integrity: phát hiện và vá 1 khóa ngoại còn thiếu hoàn toàn (`assignment_submissions.course_post_id`) trong lúc test cascade-delete end-to-end — dữ liệu mồ côi có thể tồn tại âm thầm trước đó
- **[MỚI]** IP spoofing mitigation: rate-limit key và audit-log IP trước đây có thể giả mạo chỉ bằng 1 header — vá bằng trust boundary dựa trên peer TCP
- **[MỚI]** Silent async failure: `@Modifying` + `@Async` thiếu `@Transactional` khiến 100% GeoIP enrichment thất bại vô hình trong nhiều tuần — chỉ phát hiện qua kiểm tra trực tiếp database, không qua log ứng dụng

*Performance* — OSIV disabled buộc transaction boundary tường minh (tốt cho N+1 prevention); Caffeine cache (Admin); React Query client-side caching.

*Technical Debt & Trade-offs* — Đã verify lại từng claim với codebase thật:
- ✅ `POST /api/notifications` — frontend có hook `useCreateNotification()` gọi thật (`CommentSection.tsx`, `CreatePost.tsx`, `PostDetails.tsx`) nhưng `NotificationController` không có endpoint tạo mới (chỉ GET, GET /unread-count, POST /mark-all-read) → gọi thất bại âm thầm
- ✅ `POST /api/auth/register` trả 405 theo chủ đích ("Self-registration is disabled")
- ~~❌ "ROLE_LECTURER uppercase check chưa khớp stored value"~~ — **bỏ claim này**: kiểm tra toàn bộ `@PreAuthorize("hasRole(...))")` trong codebase đều dùng `'lecturer'` chữ thường nhất quán, khớp đúng cách `UserDetailsServiceImpl` thêm tiền tố `ROLE_`; không tìm thấy bằng chứng bug này tồn tại
- **[MỚI]** Trust boundary hiện suy luận "đáng tin" từ peer là private/loopback thay vì allowlist tường minh — đủ dùng cho single-host nhưng cần allowlist cấu hình qua env var cho topology phức tạp hơn (xem 6.2)
- **[MỚI]** Định vị GPS reverse-geocode là best-effort — dữ liệu OSM không đồng nhất 3 cấp hành chính ở mọi nơi tại Việt Nam sau sáp nhập; xử lý bằng loại trùng thay vì đảm bảo luôn đủ 3 cấp

---

## Chương 6 — CONCLUSION AND FUTURE WORK

**6.1 Conclusion** — myIU đạt mục tiêu: nền tảng thống nhất, tích hợp SSO doanh nghiệp, admin panel đầy đủ, kiến trúc tách biệt rõ ràng Portal/Admin, cascade-delete có chủ đích, chống giả mạo IP, định vị GPS opt-in.

**6.2 Future Work and Technical Debt Mitigation**
- Mobile app (React Native) dùng chung backend API
- Chuyển sang microservices nếu scale lên nhiều trường
- ~~WebSocket/SSE cho real-time notification thay polling~~ — **bỏ, đã có real-time push từ đầu (3.8)**
- **[MỚI]** Xây lại pipeline CI/CD thật sự chạy được: `deploy-dev.yml`/`deploy-prod.yml` cũ giả định myIU-admin là thư mục con của repo này (thực tế là repo riêng) — chưa từng deploy thành công, đã gỡ thay vì để hỏng; cần thiết kế lại cho đúng 2-repo topology (checkout kép hoặc pipeline riêng mỗi repo)
- **[MỚI]** Allowlist IP tin cậy tường minh (cấu hình qua env var) thay cho heuristic private/loopback hiện tại
- Observability: structured logging, Prometheus metrics (đã có `/actuator/prometheus`), Grafana dashboard
- Multi-tenant nếu mở rộng ra nhiều trường đại học
- Bổ sung `POST /api/notifications` còn thiếu (5.2) hoặc gỡ bỏ hook `useCreateNotification` phía frontend nếu không còn cần thiết

---

## Tài liệu tham khảo bổ sung cần thêm (nếu chưa có)

- Tài liệu chính sách sử dụng Nominatim (OpenStreetMap Foundation) — vì đã dùng dịch vụ này thật trong 3.7/5.8
- Tài liệu Spring Data JPA về hành vi transaction của `@Modifying` query — hỗ trợ luận điểm ở 5.2/5.8
