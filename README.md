# myIU Portal

Cổng thông tin học thuật nội bộ cho **Trường Đại học Quốc tế HCMIU-VNU** — tích hợp Azure AD SSO, quản lý môn học, biểu mẫu học vụ, mạng xã hội nội bộ, thông báo và nhiều tính năng khác.

**Stack:** `Express.js + MSAL Node` · `React 18 + TypeScript + Appwrite` · `Tailwind CSS + Shadcn UI` · `i18next` · `React Query v5`

---

## Tính năng

### Học thuật
- **Trang chủ (Dashboard)** — tổng quan môn học đang học, điểm gần đây, thông báo, trạng thái biểu mẫu
- **Môn học** — danh sách môn học, nhóm lớp, bài đăng (thông báo / tài liệu / bài tập), bảng điểm
- **Biểu mẫu** — nộp đơn học vụ, theo dõi trạng thái duyệt; giảng viên duyệt / từ chối

### Xã hội
- Feed bài đăng với like, save, comment, @mention
- Trang Explore, hồ sơ cá nhân
- Thông báo (bell + trang đầy đủ)

### Hệ thống
- **Azure AD SSO** — đăng nhập Microsoft qua MSAL backend
- **Phân quyền**: Student / Faculty / Admin (từ Azure AD App Roles)
- **Dark mode** — Zalo `nl`-series navy
- **Đa ngôn ngữ** — Tiếng Việt / English (i18n)

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Shadcn UI, Zalo color tokens |
| State | React Query (TanStack) |
| Backend | Express.js, MSAL Node |
| Database | Appwrite (collections + storage) |
| Auth | Azure AD OAuth 2.0 |
| i18n | react-i18next (EN, VI) |

---

## Cấu trúc dự án

```
myIU/
├── frontend/
│   └── src/
│       ├── _auth/              # AuthLayout, SignInForm (Azure AD)
│       ├── _root/
│       │   └── pages/          # Home, Courses, CourseDetail, Forms,
│       │                       # FormReview, Notifications, Profile, ...
│       ├── components/shared/  # LeftSidebar, Topbar, PostCard, UserAvatar, ...
│       ├── constants/          # courses.ts (màu bìa, học kỳ)
│       ├── context/            # AuthContext, ThemeContext
│       ├── lib/
│       │   ├── appwrite/       # Appwrite client + API
│       │   ├── msal/           # Azure AD config
│       │   └── react-query/    # Queries & mutations
│       ├── locales/            # en.json, vi.json
│       └── types/              # TypeScript interfaces
├── backend/
│   └── src/
│       ├── controller.js       # MSAL OAuth handlers
│       └── router.js           # Express routes
└── appwrite/
    └── scripts/                # Script tạo Appwrite collections
```

---

## Khởi chạy

### Yêu cầu
- Node.js 18+
- Appwrite instance (cloud hoặc self-hosted)
- Azure AD app registration với App Roles (Student / Faculty / Admin)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # điền giá trị thực tế
npm run dev
# → http://localhost:5173
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # điền giá trị thực tế
npm run dev
# → http://localhost:3000
```

---

## Biến môi trường

**`frontend/.env`**
```env
VITE_APPWRITE_URL=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_STORAGE_ID=
VITE_APPWRITE_USER_COLLECTION_ID=
VITE_APPWRITE_POST_COLLECTION_ID=
VITE_APPWRITE_SAVES_COLLECTION_ID=
VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID=
VITE_APPWRITE_COURSES_COLLECTION_ID=
VITE_APPWRITE_COURSE_GROUPS_COLLECTION_ID=
VITE_APPWRITE_COURSE_POSTS_COLLECTION_ID=
VITE_APPWRITE_COURSE_GRADES_COLLECTION_ID=
VITE_APPWRITE_FORM_SUBMISSIONS_COLLECTION_ID=
VITE_AD_CLIENT_ID=
VITE_AD_TENANT_ID=
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OAUTH_BACKEND_URL=http://localhost:3000
```

**`backend/.env`**
```env
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=
SESSION_SECRET=
FRONTEND_URL=http://localhost:5173
PORT=3000
```

---

## Appwrite Collections

| Collection | Mục đích |
|---|---|
| `users` | Hồ sơ người dùng |
| `posts` | Bài đăng mạng xã hội |
| `saves` | Bài đăng đã lưu |
| `notifications` | Thông báo |
| `courses` | Danh sách môn học |
| `course_groups` | Nhóm lớp theo môn |
| `course_group_members` | Sinh viên trong nhóm |
| `course_posts` | Thông báo / tài liệu / bài tập |
| `course_grades` | Điểm số sinh viên |
| `form_submissions` | Biểu mẫu học vụ |

---

## Hệ màu

Dựa trên [Zalo color tokens](https://miniapp.zaloplatforms.com/documents/framework/components/color-themes/) + màu thương hiệu IU:

| Token | Hex | Dùng cho |
|---|---|---|
| IU Navy | `#0B2275` | Header card môn học |
| IU Blue | `#179BD7` | Link, active state |
| Zalo Blue | `#0068FF` | Nút chính |
| Success | `#00c578` | Trạng thái đã duyệt |
| Error | `#ef4e49` | Trạng thái từ chối |
| Warning | `#f5832f` | Trạng thái chờ duyệt |

Dark mode dùng `html.dark` class strategy với nền Zalo `nl`-series navy (`#001121` → `#001a33`).

---

## Phân quyền

| Role | Quyền |
|---|---|
| Student | Xem môn học đã ghi danh, nộp biểu mẫu, xem điểm của mình |
| Faculty | Tạo/quản lý môn học, nhóm, bài đăng, chấm điểm, duyệt biểu mẫu |
| Admin | Toàn quyền Faculty trên tất cả môn học |

Role được lấy từ Azure AD App Roles qua OAuth token.
