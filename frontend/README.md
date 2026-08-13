# myIU Portal — Frontend

React 18 + TypeScript + Vite frontend cho cổng thông tin sinh viên IU.

## Tech stack

| Package | Version | Mục đích |
|---|---|---|
| React / React DOM | 18.2 | UI framework |
| React Router DOM | 6.22 | SPA routing |
| TanStack React Query | 5 | Server state, caching, mutations |
| React Hook Form + Zod | 7 / 3 | Form validation |
| Axios | 1.13 | HTTP client |
| @azure/msal-browser | 5 | Microsoft SSO |
| @stomp/stompjs + sockjs-client | 7 / 1.6 | WebSocket (real-time notifications) |
| Swiper | 11 | Image carousel (sign-in page) |
| i18next + react-i18next | 25 / 16 | Internationalization (VI / EN) |
| lucide-react | 0.344 | Icons |
| TailwindCSS | 3.4 | Styling |
| Vite | 5.1 | Dev server + build tool |

## Cài đặt

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Biến môi trường

Tạo file `.env` từ `.env.example`:

| Variable | Mô tả |
|---|---|
| `VITE_API_URL` | URL backend (default: `http://localhost:8080`) |
| `VITE_AD_CLIENT_ID` | Azure App Registration client ID |
| `VITE_AD_TENANT_ID` | Azure AD tenant ID |
| `VITE_REDIRECT_URI` | OAuth2 callback URL |

## Cấu trúc thư mục

```
frontend/src/
  ├── _auth/                  # Màn hình đăng nhập, OAuth2 callback, ForgotPassword
  │   ├── AuthLayout.tsx      # Split layout: form trái + Swiper carousel phải
  │   └── forms/
  │       └── SignInForm.tsx
  │
  ├── _root/
  │   ├── RootLayout.tsx      # Layout chính (sidebar + topbar)
  │   └── pages/
  │       ├── Home.tsx              # Feed bài đăng
  │       ├── CoursesPage.tsx       # Danh sách môn học
  │       ├── CourseDetail.tsx      # Chi tiết môn học
  │       │                         #   Tabs: Feed · Materials · Assignments · Attendance · Grades · Members
  │       │                         #   AssignmentCard: nộp bài, xem bài nộp, chấm điểm
  │       │                         #   AttendanceTab: điểm danh hàng buổi (giảng viên) / lịch sử (sinh viên)
  │       ├── FormsPage.tsx         # Dashboard biểu mẫu (nộp / duyệt)
  │       ├── FormReviewPage.tsx    # Xét duyệt đơn
  │       ├── TimetablePage.tsx     # Thời khóa biểu
  │       ├── Notifications.tsx     # Trang thông báo đầy đủ
  │       ├── SupportPage.tsx       # Gửi & theo dõi ticket hỗ trợ
  │       ├── Settings.tsx          # Cài đặt + quản lý phiên đăng nhập
  │       ├── Profile.tsx           # Trang hồ sơ người dùng
  │       ├── UpdateProfile.tsx     # Chỉnh sửa hồ sơ
  │       └── Tenant.tsx            # Quản lý tenant
  │
  ├── components/
  │   ├── shared/
  │   │   ├── Topbar.tsx            # IU seal + institution name, notifications, profile
  │   │   ├── LeftSidebar.tsx       # Navigation với tab-underline indicator (màu #0057A8)
  │   │   └── NotificationBell.tsx  # Bell icon + unread badge
  │   └── ui/                       # Radix UI primitives (Button, Toast, ...)
  │
  ├── constants/
  │   ├── ui.ts               # FORM_STATUS, FILE_TYPE_META, FORM_CATEGORIES
  │   └── courses.ts          # INPUT_CLS và hằng số khóa học
  │
  ├── context/
  │   └── AuthContext.tsx          # User JWT + profile context
  │
  ├── hooks/
  │   ├── useNotificationSocket.ts  # WebSocket / STOMP hook
  │   ├── useDebounce.ts
  │   └── geoLocation.ts            # requestAndReportGeoLocation() — xin quyền GPS 1 lần sau login,
  │                                 #   gửi lên backend nếu người dùng đồng ý (từ chối thì bỏ qua)
  │
  ├── lib/
  │   ├── appwrite/
  │   │   └── api.ts          # Tất cả API calls (axios wrapper: api.get/post/put/delete)
  │   ├── react-query/
  │   │   └── queriesAndMutations.ts  # Tất cả useQuery / useMutation hooks
  │   └── utils.ts            # formatTimeAgo, isAdminRole, cn()
  │
  ├── locales/
  │   ├── vi.json             # Tiếng Việt
  │   └── en.json             # English
  │
  ├── types/
  │   └── index.ts            # IUser, IFormTemplate, IFormSubmission, ...
  │
  └── i18n.ts                 # i18next config
```

## Tính năng chính

### Học tập (sinh viên & giảng viên)
- **Quản lý môn học** — Danh sách khóa học, nhóm học, thành viên
- **Nộp bài tập** — Student nộp file/text, hệ thống tự detect LATE nếu quá hạn; giảng viên chấm điểm + feedback
- **Điểm danh** — Giảng viên chọn ngày, đánh P/L/A/E từng sinh viên, bulk save; sinh viên xem lịch sử
- **Bảng điểm** — Giảng viên nhập điểm từng phần, sinh viên xem điểm tổng kết
- **Thời khóa biểu** — Lịch học theo tuần với phòng học

### Hành chính
- **Biểu mẫu** — Nộp đơn từ template, theo dõi trạng thái Chờ/Đã duyệt/Từ chối; reviewer duyệt
- **Email tự động** — Backend gửi email khi đơn được duyệt/từ chối (Gmail SMTP async)
- **Hỗ trợ kỹ thuật** — Submit ticket, theo dõi trạng thái, admin respond

### Hệ thống
- **Đăng nhập Microsoft SSO** — MSAL + OAuth2 redirect flow
- **Thông báo real-time** — WebSocket STOMP qua SockJS; bell icon với unread count
- **Đa ngôn ngữ** — Tiếng Việt và English (i18next + Google Translate widget)
- **Quản lý phiên** — Xem và thu hồi sessions (meta-style) trong Settings. Sau khi login, xin quyền
  vị trí browser 1 lần — nếu đồng ý, vị trí hiện tới phường/quận/tỉnh thay vì chỉ thành phố (IP-based)

> **Không có admin panel trong repo này.** Có tồn tại 1 thiết kế cũ nhúng admin ở route `/admin`
> (`_admin/`, `AdminAuthContext.tsx`, endpoint `/api/admin/*`) nhưng đã bị thay thế hoàn toàn bởi app
> riêng **myIU-admin** (repo khác, port 3000/8081) — không còn tồn tại trong source hiện tại.

## Build production

```bash
npm run build
# Output: frontend/dist/
# Vite inject VITE_API_URL at build time
```

Docker image:
```bash
docker build \
  --build-arg VITE_API_URL=https://api.myiu.edu.vn \
  -t myiu-portal-frontend:latest \
  frontend/
```
