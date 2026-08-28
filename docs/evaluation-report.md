# myIU — Báo cáo Đánh giá Triển khai (Implementation & Evaluation Report)

*Viết theo cùng khung Chương 4–5 (Implementation and Results / Discussion and Evaluation) như report "MediMaster" của Huỳnh Ngọc Anh Thư (ITCSIU21034) — nhưng với một nguyên tắc khác biệt cốt lõi: **mọi con số dưới đây đều vừa được chạy thật, ngay trước khi viết dòng này**, không dựng lại từ trí nhớ hay suy đoán. Chỗ nào chưa có công cụ/số liệu thật, báo cáo ghi rõ "chưa làm" thay vì bịa ra một kết quả nghe hợp lý.*

---

## 1. Phạm vi đánh giá

Hệ thống gồm 2 backend độc lập chia sẻ 1 PostgreSQL:
- **myIU (Portal)** — Spring Boot 3.4.1 / Java 21, `:8080`, sở hữu schema qua Flyway (V1–V12).
- **myIU-admin (Admin Panel)** — Spring Boot 3.4.1 / Java 21, `:8081`, `ddl-auto: none`.

Kiến trúc chi tiết đã có ở `docs/system-design.html` và `docs/codebase-reference.html`; báo cáo này không lặp lại phần đó, mà tập trung vào phần MediMaster-report gọi là "Results" và "Evaluation" — tức là: **hệ thống có thực sự chạy đúng như nó tuyên bố không, và bằng chứng là gì.**

---

## 2. Kết quả kiểm thử tự động (Test Results) — số liệu thật, chạy trực tiếp hôm nay

### 2.1 Portal backend (`myIU/backend`)

| Trước khi audit | Sau khi audit |
|---|---|
| `./mvnw test -Dtest=SessionServiceTest,GeoIpServiceTest` | cùng lệnh |
| **Tests run: 7, Failures: 1, Errors: 1** | **Tests run: 8, Failures: 0, Errors: 0 — BUILD SUCCESS** |

Phát hiện khi chạy lần đầu: `SessionServiceTest.createSession_uses_x_forwarded_for_header` **fail thật**, kèm `UnnecessaryStubbing` (Mockito strict-stub) trên test còn lại. Nguyên nhân gốc: test được viết **trước** đợt vá lỗ hổng giả mạo IP (`IpUtils.extractIp()` — chỉ tin `X-Forwarded-For` khi peer TCP là proxy tin cậy). Sau khi vá, hành vi thật của `SessionService.createSession()` đã đổi, nhưng test cũ không được cập nhật theo — tức là **bộ test đã đỏ kể từ đợt vá bảo mật đó, không ai chạy lại để biết.**

Đã sửa trong lúc viết báo cáo này (`myIU/backend/src/test/java/com/myiu/portal/SessionServiceTest.java`):
- Bỏ 2 stub không còn dùng tới trong `createSession_saves_immediately_without_waiting_for_geoip`.
- Sửa `createSession_uses_x_forwarded_for_header` → `createSession_uses_x_forwarded_for_header_only_from_trusted_proxy`, stub đúng `getRemoteAddr()` = `127.0.0.1` (peer tin cậy) để test phản ánh đúng hành vi hiện tại.
- **Thêm mới** `createSession_ignores_x_forwarded_for_from_untrusted_peer` — regression test riêng cho chính lỗ hổng IP-spoofing đã vá: peer public (`8.8.8.8`) + header `X-Forwarded-For` giả mạo → phải bị bỏ qua.

→ Tổng test của Portal backend: **8 test, 100% pass**, nhưng đây là toàn bộ những gì tồn tại — chỉ 2 class (`GeoIpServiceTest`, `SessionServiceTest`), cả hai đều là unit test kèm Mockito. Không có integration test nào chạm DB thật, dù `docs/backend/README.md` từng ghi "Testcontainers PostgreSQL thật" — câu đó mô tả **CI có khả năng chạy Testcontainers nếu có test dùng nó**, không phải đã có test nào thực sự dùng.

### 2.2 Admin backend (`myIU-admin/backend`)

```
find backend/src/test → không tồn tại thư mục
```

**0 test.** Toàn bộ nghiệp vụ cascade-delete, FK-violation handling, session revoke, GPS mirror field — không có gì được test tự động.

### 2.3 Portal frontend (`myIU/frontend`) — ESLint thật, `--max-warnings 0`

```
npm run lint
✖ 177 problems (165 errors, 12 warnings)
```

Đáng chú ý: `package.json` cấu hình `--max-warnings 0`, nghĩa là **theo đúng định nghĩa lint script của chính dự án, build này đang fail** — không phải "còn vài warning chấp nhận được", mà là vượt ngưỡng do chính dự án đặt ra. Phần lớn là `@typescript-eslint/no-explicit-any` và biến khai báo nhưng không dùng (`no-unused-vars`).

### 2.4 Admin frontend (`myIU-admin/frontend`)

```
npm run lint
npm error Missing script: "lint"
```

Không có script lint nào được cấu hình — không phải "lint sạch", mà là **chưa từng được thiết lập để kiểm tra.**

### 2.5 CI thực sự sẽ nói gì

`myIU/.github/workflows/ci.yml` cấu hình 2 job chạy trên mọi push/PR vào `main`/`develop`:
- `lint-frontend`: `npx tsc --noEmit` + `npm run lint --if-present`
- `test-portal`: `./mvnw test --no-transfer-progress`

Tức là **CI đã được viết đúng để bắt được cả 2 vấn đề trên** (test đỏ + lint vượt ngưỡng) — vấn đề không phải là thiếu CI, mà là không có bằng chứng CI từng chạy xanh trên nhánh `main` hiện tại trước các lần merge trong phiên làm việc này (không có quyền truy cập GitHub Actions dashboard để xác nhận trực tiếp, nhưng chạy lại y hệt lệnh CI trên máy local cho kết quả đỏ ở cả 2 job, tại đúng thời điểm này).

---

## 3. Bảo mật & độ tin cậy — bằng chứng từ lỗi thật đã tìm thấy và vá

Không có Snyk/SonarQube scan nào từng chạy trên 2 repo này (xem mục 4). Thay vào đó, đây là danh sách lỗ hổng/bug **thật, đã xác minh bằng cách tái hiện rồi vá**, trong quá trình làm việc trực tiếp trên hệ thống:

| # | Vấn đề | File | Cách phát hiện | Trạng thái |
|---|---|---|---|---|
| 1 | Giả mạo IP qua `X-Forwarded-For` — bypass rate-limit đăng nhập + giả vị trí audit log | `IpUtils.java` | Kiểm tra thủ công header vs. giá trị hiển thị | Đã vá + có regression test (mục 2.1) |
| 2 | `@Async` + `@Modifying` thiếu `@Transactional` → 100% GeoIP enrichment fail âm thầm | `GeoIpService.lookupAndEnrich()` | Query DB trực tiếp thấy toàn bộ session kẹt "Resolving"; xác nhận qua log `TransactionRequiredException` | Đã vá |
| 3 | So khớp email phân biệt hoa/thường → SSO login fail (`not_provisioned`) | dữ liệu `users.email` | Tái hiện lỗi đăng nhập thật, so email DB vs. OAuth claim | Đã vá dữ liệu (4 dòng) |
| 4 | Thiếu FK `assignment_submissions.course_post_id` — dữ liệu mồ côi có thể tồn tại | schema | Phát hiện khi test cascade-delete end-to-end | Đã vá (migration V11) |
| 5 | 2 thư mục `uploads/` tách biệt giữa Portal và Admin, trong khi URL upload sinh ra giả định dùng chung | `FileController.java` (admin) / `.env` cả 2 backend | Người dùng báo "tải về không ra gì", kiểm tra thấy thư mục Admin trống | Đã vá (`UPLOAD_DIR` tuyệt đối, dùng chung) |
| 6 | `String.format("%f", ...)` nhạy locale — có thể phá URL Nominatim trên JVM locale dấu phẩy thập phân | `GeoIpService.reverseGeocode()` | Tự review code sau khi hoàn thành tính năng | Đã vá (`Locale.US`) |
| 7 | Trùng phường/quận trong địa chỉ GPS (`"Phường Bình Thạnh, Phường Bình Thạnh, TP.HCM"`) | `GeoIpService.reverseGeocode()` | Người dùng báo cáo trực tiếp | Đã vá (dedup) |

**Điểm chung của cả 7 lỗi**: không lỗi nào được bắt bởi test tự động hay static analysis — toàn bộ đến từ debug thủ công *sau khi* đã xảy ra (đăng nhập fail, dữ liệu 0 users, "tải về không ra gì"...). Đây là bằng chứng trực tiếp cho khoảng trống ở mục 2 và mục 4: có lỗ hổng/bug thật, có khả năng tìm và vá đúng, nhưng thiếu lớp phòng ngừa để bắt được trước khi người dùng chạm phải.

---

## 4. Nợ kỹ thuật thẳng thắn (Strategic Technical Debt) — không tô hồng

So với chuẩn mực report MediMaster (32 test suite / 192 test case, SonarQube, Snyk, Clinic.js profiling, load benchmark, chaos testing), myIU **chưa có** ở thời điểm báo cáo này:

- **Không có SAST/SCA scan** (không SonarQube, không Snyk) trên cả 2 repo — không biết được có lỗ hổng dependency nào đang treo lơ lửng hay không.
- **Không có performance/load benchmark** nào từng chạy — không có số liệu latency/throughput thật để trích dẫn.
- **Không có integration test chạm DB thật** — Testcontainers được nhắc tới trong tài liệu CI nhưng chưa có test nào thực sự dùng nó.
- **Admin backend: 0 test.** Toàn bộ logic cascade-delete, FK-violation mapping, revoke session — rủi ro cao nhất trong cả hệ thống về mặt "không ai biết nó còn đúng sau lần sửa tiếp theo hay không" — lại đang là phần không có lưới an toàn nào.
- **Admin frontend: chưa cấu hình lint.**
- **CI được viết đúng nhưng chưa xác nhận đã từng xanh** trên các lần merge thẳng vào `main` trong phiên làm việc vừa qua.

Đây không phải điểm để giấu — đây chính xác là phần một báo cáo trung thực phải nói to nhất, vì nó là phần dễ bị bỏ qua nhất khi chỉ nhìn vào tính năng đã chạy được trên UI.

---

## 5. Kết luận

Tính năng thì thật: SSO Azure AD, JWT xuyên 2 service, WebSocket real-time, GPS reverse-geocoding, cascade-delete có chủ đích, IP-trust hardening — tất cả đều chạy được và đã được xác minh bằng tay. Nhưng khoảng cách với một report ở tầm MediMaster không nằm ở tính năng, mà nằm ở **lớp bằng chứng đứng sau tính năng**: MediMaster trích dẫn số test suite, % pass, kết quả SonarQube/Snyk, benchmark latency thật; myIU tới trước báo cáo này thậm chí không tự biết bộ test 8 case ít ỏi của mình đang đỏ.

Việc đáng làm tiếp theo, theo đúng thứ tự ưu tiên rút ra từ chính báo cáo này:
1. Bật `test-portal` job trên CI thật, xác nhận xanh, biến nó thành điều kiện bắt buộc để merge (branch protection) — không merge thẳng vào `main` khi CI chưa chạy xong.
2. Viết test cho Admin backend, bắt đầu từ đúng 2 vùng rủi ro cao nhất: cascade-delete và FK-violation mapping.
3. Chạy Snyk (free tier, như MediMaster đã dùng) một lần cho cả 2 repo — chi phí gần bằng 0, giá trị thông tin cao.
4. Dọn 177 lỗi ESLint ở Portal frontend cho về đúng ngưỡng `--max-warnings 0` mà chính dự án đã tự đặt ra.
