# myIU Portal

Cổng thông tin nội bộ cho **Trường Đại học Quốc tế HCMIU-VNU** — tích hợp Azure AD SSO, mạng xã hội nội bộ, danh bạ người dùng, quản lý hồ sơ, thông báo thời gian thực và nhiều tính năng khác.

**Stack:** `Express.js + MSAL Node` (backend) · `React 18 + TypeScript + Appwrite` (frontend) · `Tailwind CSS + Shadcn UI` (design) · `i18next` (đa ngôn ngữ) · `React Query v5` (state)

---

## Mục lục

1. [Kiến trúc hệ thống](#1-kiến-trúc-hệ-thống)
2. [Tính năng hoàn thành](#2-tính-năng-hoàn-thành)
3. [Ứng dụng vào bài toán thực tế](#3-ứng-dụng-vào-bài-toán-thực-tế)
4. [Cài đặt Backend](#4-cài-đặt-backend)
5. [Cài đặt Frontend](#5-cài-đặt-frontend)
6. [Appwrite — Schema Database đầy đủ](#6-appwrite--schema-database-đầy-đủ)
7. [Kết nối pgAdmin / Appwrite Console](#7-kết-nối-pgadmin--appwrite-console)
8. [Đăng ký Azure AD App](#8-đăng-ký-azure-ad-app)
9. [Chạy môi trường local](#9-chạy-môi-trường-local)
10. [API Reference đầy đủ](#10-api-reference-đầy-đủ)
11. [Cấu trúc thư mục](#11-cấu-trúc-thư-mục)
12. [Roadmap — Cần làm tiếp](#12-roadmap--cần-làm-tiếp)
13. [Xử lý sự cố](#13-xử-lý-sự-cố)
14. [Triển khai Production](#14-triển-khai-production)

---

## 1. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                          Trình duyệt                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React App  (Vite · port 5173)               │   │
│  │  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │   │
│  │  │  Auth Pages  │  │ Root Pages │  │  Shared Comps    │  │   │
│  │  │  /sign-in    │  │ /home      │  │  Topbar          │  │   │
│  │  │  /sign-up    │  │ /explore   │  │  LeftSidebar     │  │   │
│  │  └──────────────┘  │ /profile   │  │  PostCard        │  │   │
│  │                    │ /settings  │  │  MediaUploader   │  │   │
│  │  ┌──────────────┐  │ /tenant    │  │  NotifBell       │  │   │
│  │  │ ThemeContext │  │ /notifs    │  └──────────────────┘  │   │
│  │  │ AuthContext  │  └────────────┘                        │   │
│  │  │ i18n (EN/VI) │                                        │   │
│  │  └──────────────┘                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│          │                              │                        │
│    /auth/* /api/*                 Appwrite SDK                  │
│    (Vite proxy)                                                  │
└──────────┼──────────────────────────────┼───────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────────────┐
│  Express Backend     │    │         Appwrite Server           │
│  (port 8080)         │    │  ┌─────────────────────────────┐ │
│                      │    │  │  Database (NoSQL)            │ │
│  MSAL Node           │    │  │  · users collection          │ │
│  ├─ /auth/login      │    │  │  · posts collection          │ │
│  ├─ /redirect        │    │  │  · saves collection          │ │
│  ├─ /api/user        │    │  │  · notifications collection  │ │
│  ├─ /api/profile     │    │  │  · comments collection       │ │
│  └─ /api/tenant      │    │  │  · blocks collection         │ │
│                      │    │  ├─────────────────────────────┤ │
│  Session store       │    │  │  Storage Bucket (media)      │ │
│  Token cache         │    │  │  · images, video, PDF, docs  │ │
└──────────┬───────────┘    │  ├─────────────────────────────┤ │
           │                │  │  Realtime (WebSocket)        │ │
           ▼                │  │  · notifications push        │ │
┌──────────────────────┐    │  └─────────────────────────────┘ │
│  Microsoft Azure AD  │    └──────────────────────────────────┘
│  · OAuth 2.0 / OIDC  │
│  · Microsoft Graph   │
│  · ARM API           │
└──────────────────────┘
```

### Luồng xác thực

```
User click "Sign in with Microsoft"
  → GET /auth/login?returnTo=/home
  → Backend tạo nonce, redirect → Azure AD
  → Azure AD xác thực → GET /redirect?code=...
  → Backend exchange code → ID token + Access token
  → Session thiết lập (req.session.isAuthenticated = true)
  → Frontend AuthContext gọi GET /api/user
  → User lưu vào Context + Appwrite (upsert)
  → Redirect đến returnTo path (/home)
```

---

## 2. Tính năng hoàn thành

### ✅ Phase 1 — Nền tảng & Mạng xã hội

| Nhóm | Tính năng | Route / File |
|---|---|---|
| **Auth** | Đăng nhập email/mật khẩu (Appwrite) | `/sign-in` |
| **Auth** | SSO Microsoft (Azure AD OIDC server-side) | `/sign-in` → `/redirect` |
| **Auth** | Đăng ký tài khoản nội bộ | `/sign-up` |
| **Auth** | Quên mật khẩu (hướng dẫn) | `/forgot-password` |
| **Feed** | Infinite scroll (9 posts/trang, cursor-based) | `/explore` |
| **Feed** | Tìm kiếm bài đăng full-text (debounced 400ms) | `/explore` |
| **Feed** | Toggle chế độ Feed / Grid | `/explore` |
| **Bài đăng** | Tạo bài với media + caption + vị trí + tags | `/create-post` |
| **Bài đăng** | Sửa bài đăng (thay media, cập nhật nội dung) | `/update-post/:id` |
| **Bài đăng** | Xóa bài đăng + xóa file khỏi storage | `PostCard` |
| **Bài đăng** | Chi tiết bài đăng (layout 2 cột, comments) | `/posts/:id` |
| **Tương tác** | Like / unlike bài đăng (optimistic update) | `PostCard`, `PostDetails` |
| **Tương tác** | Lưu / bỏ lưu bài đăng | `PostCard`, `PostDetails` |
| **Saved** | Danh sách bài đăng đã lưu (với count) | `/saved` |
| **Người dùng** | Danh bạ tất cả thành viên (có tìm kiếm + phân trang) | `/all-users` |
| **Hồ sơ** | Trang cá nhân: cover, stats, MS Graph info, posts grid | `/profile/:id` |
| **Hồ sơ** | Chỉnh sửa tên, bio, ảnh đại diện | `/update-profile/:id` |
| **Tenant** | Xem thông tin Azure AD tenant, Graph profile, ARM data | `/tenant` |
| **Home** | Dashboard chào mừng với quick links | `/home` |

### ✅ Phase 2 — Tương tác xã hội & Cài đặt

| Nhóm | Tính năng | Route / File |
|---|---|---|
| **@Mention** | Gõ @ trong caption → dropdown chọn người dùng | `MentionInput.tsx` |
| **@Mention** | Tạo notification tự động khi được @mention | `CreatePost.tsx` |
| **Bình luận** | Thêm / xóa bình luận bài đăng | `CommentSection.tsx` |
| **Bình luận** | @mention trong bình luận → notification | `CommentSection.tsx` |
| **Notification** | Bell icon với badge số chưa đọc | `NotificationBell.tsx` |
| **Notification** | Dropdown 5 thông báo mới nhất (Realtime) | `NotificationBell.tsx` |
| **Notification** | Trang thông báo đầy đủ (filter all/unread) | `/notifications` |
| **Notification** | Đánh dấu đã đọc (từng cái / tất cả) | `/notifications` |
| **Notification** | Push khi like bài đăng (PostDetails) | `PostDetails.tsx` |
| **Cài đặt** | Toggle hồ sơ Public / Private | `/settings` → Privacy |
| **Cài đặt** | Chặn / bỏ chặn người dùng | `/settings` → Blocked |
| **Cài đặt** | Lịch sử bài đã thích | `/settings` → Activity |
| **Cài đặt** | Lịch sử bình luận đã đăng | `/settings` → Activity |
| **Cài đặt** | Phiên đăng nhập Appwrite | `/settings` → Activity |

### ✅ Phase 3 — UX Nâng cao (session hiện tại)

| Nhóm | Tính năng | File |
|---|---|---|
| **Giao diện** | Dark / Light mode (ThemeContext, persist localStorage) | `ThemeContext.tsx` |
| **Giao diện** | Dark mode đầy đủ trên tất cả pages | Tất cả `_root/pages/*.tsx` |
| **Giao diện** | Dark mode không ảnh hưởng sign-in page | `AuthLayout.tsx` |
| **Đa ngôn ngữ** | Tiếng Anh / Tiếng Việt (i18next) | `i18n.ts`, `locales/*.json` |
| **Đa ngôn ngữ** | Toàn bộ strings được dịch (100% coverage) | `en.json`, `vi.json` |
| **Đa ngôn ngữ** | Chuyển ngôn ngữ trong Settings → Appearance | `Settings.tsx` |
| **Upload** | Multi-file upload (tối đa 5 files/bài) | `MediaUploader.tsx` |
| **Upload** | Hỗ trợ: Ảnh, Video, PDF, Word, Excel, PPT | `MediaUploader.tsx` |
| **Upload** | Preview grid theo loại file (thumbnail/icon) | `MediaUploader.tsx` |
| **PostCard** | Hiển thị multi-media (1/2/3+ grid layout) | `PostCard.tsx` |
| **PostCard** | Dark mode hoàn chỉnh | `PostCard.tsx` |
| **Cài đặt** | Tab Giao diện: chọn theme + ngôn ngữ | `Settings.tsx` |
| **Auth** | Profile MS Identity chỉ hiện cho MS accounts | `Profile.tsx` |
| **Auth** | Bỏ auto-redirect MSAL cho local accounts | `AuthContext.tsx` |

---

## 3. Ứng dụng vào bài toán thực tế

### Bài toán 1 — Thay thế nhóm chat nội bộ

**Vấn đề:** Thông báo nội bộ trường rải rác trên Facebook, Zalo, email. Sinh viên/giảng viên bỏ lỡ thông tin quan trọng.

**Giải pháp myIU:**
- Feed bài đăng với infinite scroll → thay thế newsfeed Facebook nội bộ
- @mention chính xác tên người → không bị bỏ lỡ thông báo
- Notification realtime (Appwrite WebSocket) → alert ngay lập tức
- Upload đính kèm: PDF thông báo, file Word mẫu đơn, ảnh sự kiện, video clip
- Tìm kiếm full-text toàn bộ bài đăng → tìm lại thông báo cũ

### Bài toán 2 — Quản lý danh tính tập trung

**Vấn đề:** IT không biết ai đang dùng tài khoản nào, không kiểm soát được session, khó audit.

**Giải pháp myIU:**
- Azure AD SSO → đăng nhập 1 lần với tài khoản trường (Single Source of Truth)
- Trang `/tenant` hiển thị: Tenant ID, Client ID, Object ID, UPN, job title, ID token claims, ARM data
- Lịch sử phiên đăng nhập trong Settings → Activity → Sessions
- `authProvider` field trong Appwrite → phân biệt tài khoản MS vs local
- Roles/groups từ Azure AD (saved vào Appwrite users.roles)

### Bài toán 3 — Cổng thông tin tự phục vụ

**Vấn đề:** Sinh viên phải đến văn phòng hoặc email để tra cứu thông tin cá nhân.

**Giải pháp myIU:**
- `/profile` — xem đầy đủ thông tin: tên, email, UPN, job title, ảnh đại diện, thống kê
- Chỉnh sửa hồ sơ (tên, bio, ảnh) trực tiếp trên web
- Microsoft Graph profile sync — dữ liệu từ Azure AD (chính xác, real-time)
- Danh bạ `/all-users` — tìm kiếm đồng nghiệp/sinh viên theo tên

### Bài toán 4 — Bảo mật & Quyền riêng tư

**Vấn đề:** Nội dung đăng lên không kiểm soát được ai xem.

**Giải pháp myIU:**
- Toggle Public/Private profile trong Settings
- Block người dùng cụ thể (lưu vào Appwrite `blocks` collection)
- Server-side OAuth — không lộ client secret, token không qua frontend
- Session expire tự động qua MSAL token lifecycle

---

## 4. Cài đặt Backend

### Yêu cầu

- Node.js ≥ 18
- npm ≥ 9
- Azure AD app registration (xem [Phần 8](#8-đăng-ký-azure-ad-app))

### Cài đặt

```bash
cd backend
npm install
```

### Biến môi trường — `backend/.env`

```env
# ── Azure AD ──────────────────────────────────────────────────────
AD_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AD_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AD_CLIENT_ID_SECRET=your-client-secret-value

# ── URLs ──────────────────────────────────────────────────────────
# Phải khớp CHÍNH XÁC với Redirect URI trên Azure App Registration
REDIRECT_URI=http://localhost:5173/redirect

# URL gốc frontend — KHÔNG có dấu / cuối
FRONTEND_ORIGIN=http://localhost:5173
BASE_URI_LOCAL=http://localhost:5173

# ── Session ───────────────────────────────────────────────────────
# Thay bằng chuỗi ngẫu nhiên mạnh (≥ 32 ký tự) khi production
SESSION_SECRET=thay-bang-chuoi-ngau-nhien-manh-khi-len-production
```

### Cấu trúc backend

```
backend/
├── appSettings.js              ← Đọc .env, build config MSAL
└── src/
    ├── app.js                  ← Express entry: CORS, session, routes
    ├── router.js               ← Route definitions
    ├── controller.js           ← Handlers: /api/user, /api/profile, /api/tenant
    ├── msal-express-wrapper/
    │   ├── auth-provider.js    ← signIn(), handleRedirect(), getToken()
    │   ├── config.js           ← MSAL ConfidentialClientApplication builder
    │   ├── tokens.js           ← Token validation (nonce, iss, aud)
    │   └── errors.js           ← Custom error types
    └── utils/
        ├── cachePlugin.js      ← Token cache → file backend/src/data/cache.json
        └── fetchManager.js     ← HTTP client với auto-retry (cho Graph/ARM calls)
```

### Packages backend

| Package | Mục đích |
|---|---|
| `express` | HTTP server |
| `express-session` | Cookie session store |
| `@azure/msal-node` | MSAL cho server-side OAuth |
| `dotenv` | Load biến môi trường |
| `nodemon` | Hot reload khi dev |

---

## 5. Cài đặt Frontend

### Yêu cầu

- Node.js ≥ 18
- Appwrite instance (tự host hoặc cloud)

### Cài đặt

```bash
cd frontend
npm install
```

### Biến môi trường — `frontend/.env`

```env
# ── Appwrite Core ─────────────────────────────────────────────────
VITE_APPWRITE_URL=http://localhost/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_STORAGE_ID=your-storage-bucket-id

# ── Appwrite Collections ──────────────────────────────────────────
VITE_APPWRITE_USERS_COLLECTION_ID=your-users-collection-id
VITE_APPWRITE_POSTS_COLLECTION_ID=your-posts-collection-id
VITE_APPWRITE_SAVES_COLLECTION_ID=your-saves-collection-id
VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID=your-notifications-collection-id
VITE_APPWRITE_COMMENTS_COLLECTION_ID=your-comments-collection-id
VITE_APPWRITE_BLOCKS_COLLECTION_ID=your-blocks-collection-id

# ── Azure AD (chỉ dùng cho MSAL PublicClientApplication) ─────────
VITE_AD_CLIENT_ID=your-azure-app-client-id
VITE_AD_TENANT_ID=your-azure-tenant-id
VITE_REDIRECT_URI=http://localhost:5173/redirect

# ── Backend URL ───────────────────────────────────────────────────
# Dev: giữ nguyên 5173 — Vite tự proxy /auth/* và /api/* sang :8080
# Production: đổi thành URL thực của backend
VITE_OAUTH_BACKEND_URL=http://localhost:5173
```

### Packages frontend chính

| Package | Mục đích |
|---|---|
| `react` + `react-dom` | UI framework |
| `vite` | Build tool + dev server |
| `typescript` | Type safety |
| `tailwindcss` | Utility-first CSS |
| `@tanstack/react-query` v5 | Server state, caching, mutations |
| `react-router-dom` | Client-side routing |
| `appwrite` | Appwrite JS SDK |
| `@azure/msal-browser` | MSAL client (fallback auth) |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `i18next` + `react-i18next` | Đa ngôn ngữ EN/VI |
| `react-dropzone` | Drag & drop file upload |
| `react-intersection-observer` | Trigger infinite scroll |
| `react-world-flags` | Cờ quốc gia trong language switcher |
| `lucide-react` | Icon library |

---

## 6. Appwrite — Schema Database đầy đủ

### Tổng quan

Appwrite là **NoSQL document database** — không có SQL hay migrations. Tất cả cấu trúc được tạo qua **Appwrite Console** (UI hoặc API).

```
Database: myiu_db
├── Collection: users
├── Collection: posts
├── Collection: saves
├── Collection: notifications
├── Collection: comments
└── Collection: blocks

Storage:
└── Bucket: media  (ảnh, video, PDF, Word, Excel, PPT)
```

---

### Collection: `users`

Lưu thông tin người dùng — cả tài khoản Microsoft lẫn local.

| Attribute | Type | Required | Size | Ghi chú |
|---|---|---|---|---|
| `accountId` | String | ✅ | 36 | Appwrite account `$id` hoặc Azure AD OID |
| `name` | String | ✅ | 100 | Tên hiển thị |
| `username` | String | ✅ | 50 | Username duy nhất, lowercase |
| `email` | Email | ✅ | — | Địa chỉ email |
| `imageUrl` | URL | ✅ | — | URL ảnh đại diện |
| `bio` | String | ❌ | 300 | Giới thiệu bản thân |
| `roles` | String[] | ❌ | 50/item | Azure AD groups (e.g. `["student", "staff"]`) |
| `authProvider` | String | ❌ | 20 | `"microsoft"` hoặc `"local"` |
| `isPrivate` | Boolean | ❌ | — | Default `false` — hồ sơ công khai |
| `liked` | String[] | ❌ | 36/item | `$id` bài đã like (dùng cho stats) |
| `imageId` | String | ❌ | 36 | File ID ảnh đại diện trên Storage |

**Indexes:**
```
accountId  → type: unique
email      → type: unique
name       → type: fulltext  (cho searchUsers)
```

**Permissions:** `read("any")`, `create("users")`, `update("users")`

---

### Collection: `posts`

Lưu nội dung bài đăng — hỗ trợ multi-media (ảnh, video, tài liệu).

| Attribute | Type | Required | Size | Ghi chú |
|---|---|---|---|---|
| `creator` | String | ✅ | 36 | `$id` của user tạo bài |
| `caption` | String | ✅ | 2200 | Nội dung, hỗ trợ @mention |
| `imageUrl` | URL | ✅ | — | URL file đầu tiên (backward compat) |
| `imageId` | String | ✅ | 36 | File ID đầu tiên (backward compat) |
| `mediaUrls` | String[] | ❌ | 2048/item | URLs tất cả files (multi-upload) |
| `mediaIds` | String[] | ❌ | 36/item | File IDs tất cả files |
| `mediaTypes` | String[] | ❌ | 20/item | Loại file: `image`/`video`/`pdf`/`word`/`excel`/`ppt` |
| `location` | String | ❌ | 100 | Vị trí địa lý (tùy chọn) |
| `tags` | String[] | ❌ | 50/item | Hashtags (không có #) |
| `likes` | String[] | ❌ | 36/item | `$id` của users đã like |
| `taggedUsers` | String[] | ❌ | 36/item | `$id` users được @mention trong caption |

**Indexes:**
```
$createdAt  → type: key, order: DESC  (feed theo thời gian)
creator     → type: key               (posts của 1 user)
caption     → type: fulltext          (searchPosts)
```

**Permissions:** `read("any")`, `create("users")`, `update("users")`, `delete("users")`

> **⚠️ Quan trọng:** Thêm `mediaUrls`, `mediaIds`, `mediaTypes` là **bắt buộc** để tính năng multi-upload hoạt động. Nếu chưa có, `createPost` sẽ báo lỗi Appwrite.

---

### Collection: `saves`

Bảng junction lưu mối quan hệ user ↔ post đã bookmark.

| Attribute | Type | Required | Size | Ghi chú |
|---|---|---|---|---|
| `user` | String | ✅ | 36 | `$id` của user |
| `post` | String | ✅ | 36 | `$id` của bài đăng |

**Indexes:**
```
user  → type: key  (getSavedPosts của 1 user)
```

**Permissions:** `create("users")`, `read("users")`, `delete("users")`

---

### Collection: `notifications`

Thông báo realtime (like, comment, mention, tag).

| Attribute | Type | Required | Size | Ghi chú |
|---|---|---|---|---|
| `userId` | String | ✅ | 36 | Người **nhận** thông báo |
| `type` | String | ✅ | 20 | `like` / `comment` / `mention` / `tag` |
| `actorId` | String | ✅ | 36 | `$id` người thực hiện hành động |
| `actorName` | String | ✅ | 100 | Tên người thực hiện (cached, tránh join) |
| `postId` | String | ❌ | 36 | `$id` bài đăng liên quan |
| `commentId` | String | ❌ | 36 | `$id` bình luận liên quan |
| `message` | String | ✅ | 500 | Nội dung thông báo (tiếng Việt) |
| `read` | Boolean | ✅ | — | Default: `false` |

**Indexes:**
```
userId      → type: key, order: DESC
$createdAt  → type: key, order: DESC
```

**Permissions:** `create("users")`, `read("users")`, `update("users")`

**Biến môi trường cần thêm:**
```env
VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID=xxx
```

---

### Collection: `comments`

Bình luận bài đăng — hỗ trợ @mention.

| Attribute | Type | Required | Size | Ghi chú |
|---|---|---|---|---|
| `postId` | String | ✅ | 36 | `$id` bài đăng |
| `userId` | String | ✅ | 36 | `$id` người bình luận |
| `authorName` | String | ✅ | 100 | Tên tác giả (cached) |
| `authorImage` | String | ❌ | 512 | URL ảnh đại diện (cached) |
| `body` | String | ✅ | 2000 | Nội dung bình luận |
| `taggedUsers` | String[] | ❌ | 36/item | `$id` users được @mention trong comment |

**Indexes:**
```
postId  → type: key, order: ASC   (getPostComments)
userId  → type: key               (activity log)
```

**Permissions:** `create("users")`, `read("users")`, `delete("users")`

**Biến môi trường cần thêm:**
```env
VITE_APPWRITE_COMMENTS_COLLECTION_ID=xxx
```

---

### Collection: `blocks`

Quản lý danh sách chặn giữa users.

| Attribute | Type | Required | Size | Ghi chú |
|---|---|---|---|---|
| `blockerId` | String | ✅ | 36 | `$id` người chặn |
| `blockedId` | String | ✅ | 36 | `$id` người bị chặn |
| `blockedName` | String | ✅ | 100 | Tên người bị chặn (cached, hiển thị UI) |

**Indexes:**
```
blockerId  → type: key
```

**Permissions:** `create("users")`, `read("users")`, `delete("users")`

**Biến môi trường cần thêm:**
```env
VITE_APPWRITE_BLOCKS_COLLECTION_ID=xxx
```

---

### Storage Bucket: `media`

Lưu tất cả files người dùng upload.

| Setting | Giá trị |
|---|---|
| Max file size | **50 MB** |
| Allowed extensions | `jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`, `mp4`, `webm`, `mov`, `avi`, `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx` |
| Permissions | `read("any")`, `create("users")`, `delete("users")` |
| Image transformations | Bật (cho `getFilePreview`) |

---

### Script tự động tạo schema

Nếu có file script trong `appwrite/scripts/`:

```bash
cd appwrite/scripts
npm install
npx ts-node create-appwrite-schema.ts
```

> **Nếu không có script:** Tạo thủ công qua Appwrite Console theo schema ở trên.  
> Thứ tự tạo: `users` → `posts` → `saves` → `notifications` → `comments` → `blocks` → Storage bucket.

---

## 7. Kết nối pgAdmin / Appwrite Console

### Appwrite Console (UI chính)

Appwrite **không dùng PostgreSQL trực tiếp** — nó là một BaaS (Backend-as-a-Service) với internal database. Quản lý qua:

**Truy cập Console:**
```
# Nếu tự host (Docker):
http://localhost

# Nếu dùng Appwrite Cloud:
https://cloud.appwrite.io
```

**Xem data trong Console:**
1. Vào **Databases** → chọn database của bạn
2. Chọn collection → **Documents** tab → xem/thêm/sửa/xóa documents
3. **Indexes** tab → quản lý indexes
4. **Attributes** tab → quản lý schema

### pgAdmin (nếu dùng Appwrite self-hosted)

Appwrite tự host dùng **MariaDB** (không phải PostgreSQL) cho internal metadata. Trong hầu hết trường hợp **không cần và không nên** truy cập database internal này trực tiếp.

**Nếu cần debug internal database:**

```yaml
# docker-compose.yml của Appwrite expose MariaDB
services:
  mariadb:
    image: mariadb:10.7
    ports:
      - "3306:3306"  # nếu không expose, thêm dòng này
```

Kết nối bằng **TablePlus / DBeaver / MySQL Workbench** (không phải pgAdmin):
```
Host:     localhost
Port:     3306
User:     root
Password: (xem trong docker-compose.yml của Appwrite)
Database: appwrite
```

> ⚠️ **Cảnh báo:** Chỉnh sửa database internal của Appwrite trực tiếp có thể gây mất dữ liệu. Luôn dùng Appwrite SDK hoặc Console.

### Xem dữ liệu thực tế qua Console

**Workflow thông thường khi debug:**

```
1. Mở Appwrite Console → Databases → myiu_db

2. users collection:
   → Kiểm tra user được tạo đúng không
   → Xem authProvider: "microsoft" hay "local"
   → Kiểm tra accountId có khớp với Azure AD OID không

3. posts collection:
   → Xem bài đăng được lưu với mediaUrls/mediaIds không
   → Kiểm tra creator field có phải $id của user không

4. Storage → media bucket:
   → Xem files đã upload
   → Kiểm tra file permissions
   → Preview ảnh/xem file size

5. notifications collection:
   → Xem notifications được tạo khi like/comment
   → Kiểm tra read field thay đổi đúng không
```

---

## 8. Đăng ký Azure AD App

1. Vào [portal.azure.com](https://portal.azure.com) → **Azure Active Directory** → **App Registrations** → **New Registration**
2. Tên: `myIU Portal`
3. Supported account types: **Single tenant** (tài khoản trong tổ chức)
4. Redirect URI: **Web** → `http://localhost:5173/redirect`
5. Sau khi tạo:
   - Copy **Application (client) ID** → `AD_CLIENT_ID`
   - Copy **Directory (tenant) ID** → `AD_TENANT_ID`
6. **Certificates & secrets** → **New client secret** → copy **Value** → `AD_CLIENT_ID_SECRET`
7. **API Permissions** → **Add a permission** → **Microsoft Graph** → **Delegated**:
   - `User.Read` — đọc profile của user đăng nhập
   - `User.ReadBasic.All` — đọc thông tin cơ bản tất cả users trong org (danh bạ)
   - Nhấn **Grant admin consent for [org]**
8. **Authentication** → **Implicit grant** → bật **ID tokens** (nếu dùng MSAL frontend)

**Redirect URIs cần đăng ký:**
```
http://localhost:5173/redirect          ← development
https://yourdomain.com/redirect         ← production
```

---

## 9. Chạy môi trường local

```bash
# Terminal 1 — Backend
cd backend
npm start
# → Express listening on http://localhost:8080

# Terminal 2 — Frontend
cd frontend
npm run dev
# → Vite dev server tại http://localhost:5173
```

Mở trình duyệt: **http://localhost:5173**

**Vite proxy** tự động forward:
- `/auth/*` → `http://localhost:8080`
- `/api/*` → `http://localhost:8080`
- `/redirect` → `http://localhost:8080`

---

## 10. API Reference đầy đủ

### Backend Endpoints (Express)

| Method | Path | Auth | Mô tả | Response |
|---|---|---|---|---|
| `GET` | `/` | ❌ | Health check | `{ status: "ok" }` |
| `GET` | `/auth/login` | ❌ | Khởi tạo OAuth flow, nhận `?returnTo=/path` | Redirect → Azure AD |
| `GET` | `/redirect` | ❌ | OAuth callback — exchange code lấy tokens | Redirect → `returnTo` |
| `GET` | `/signout` | ❌ | Hủy session + logout MSAL | Redirect → sign-in |
| `GET` | `/api/user` | ✅ Session | Thông tin từ ID token claims | `{ id, name, username, email, imageUrl }` |
| `GET` | `/api/profile` | ✅ Session + Graph | Microsoft Graph `/me` endpoint | `{ displayName, mail, jobTitle, userPrincipalName, idTokenClaims, ... }` |
| `GET` | `/api/tenant` | ✅ Session | Tenant claims + Graph profile + ARM data | `{ tenantId, clientId, objectId, issuer, graphProfile, armTenant }` |

**Cấu trúc response `/api/user`:**
```json
{
  "id": "appwrite-user-$id",
  "name": "NGUYEN TAN PHAT",
  "username": "phatnt12",
  "email": "phatnt12@student.hcmiu.edu.vn",
  "imageUrl": "https://...",
  "bio": ""
}
```

**Cấu trúc response `/api/profile`:**
```json
{
  "displayName": "NGUYEN TAN PHAT",
  "userPrincipalName": "ITITIU21354@student.hcmiu.edu.vn",
  "mail": "ITITIU21354@student.hcmiu.edu.vn",
  "jobTitle": "student",
  "idTokenClaims": { "oid": "...", "tid": "...", "preferred_username": "..." }
}
```

**Cấu trúc response `/api/tenant`:**
```json
{
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "objectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "NGUYEN TAN PHAT",
  "email": "...",
  "username": "...",
  "issuer": "https://sts.windows.net/...",
  "displayName": "...",
  "idTokenClaims": {},
  "graphProfile": { ... },
  "armTenant": { ... }
}
```

---

### Appwrite SDK Functions (`src/lib/appwrite/api.ts`)

#### Auth

| Hàm | Params | Mô tả |
|---|---|---|
| `createUserAccount(user)` | `INewUser` | Tạo account Appwrite + lưu vào users collection |
| `saveUserToDB(user)` | object | Insert document vào users collection |
| `signInAccount(user)` | `{email, Password}` | Tạo Appwrite email session |
| `signOutAccount()` | — | Xóa session Appwrite hiện tại |
| `getCurrentUser()` | — | Lấy user đang đăng nhập từ Appwrite session |
| `syncMicrosoftUser(msalUser)` | MS profile object | Upsert MS user vào Appwrite (khi sign-in với Azure AD) |

#### Users

| Hàm | Params | Mô tả |
|---|---|---|
| `getAllUsers(limit?)` | number | Tất cả users (default 50) |
| `getUsersPaginated(page, limit)` | numbers | Users có phân trang |
| `getUserById(userId)` | string | 1 user theo `$id` |
| `updateUser(user)` | `IUpdateUser` | Cập nhật name, bio, imageUrl |
| `searchUsers(searchTerm)` | string | Full-text search theo `name` |
| `updateUserPrivacy(userId, isPrivate)` | string, boolean | Toggle public/private |
| `getAccountSessions()` | — | Phiên đăng nhập từ Appwrite |

#### Posts

| Hàm | Params | Mô tả |
|---|---|---|
| `createPost(post)` | `INewPost` | Upload files (multi) + tạo document |
| `getRecentPosts()` | — | 20 bài mới nhất |
| `getInfinitePosts({pageParam})` | cursor | Phân trang cursor (9/trang) |
| `getPostById(postId)` | string | 1 bài đăng |
| `getUserPosts(userId)` | string | Tất cả bài của 1 user |
| `getUserPostsPaginated(userId, page, limit)` | — | Bài của user có phân trang |
| `updatePost(post)` | `IUpdatePost` | Sửa bài, tùy chọn thay file |
| `deletePost(postId, imageId)` | strings | Xóa bài + file storage |
| `likePost(postId, likesArray)` | string, string[] | Cập nhật array likes |
| `searchPosts(searchTerm)` | string | Full-text search theo `caption` |

#### Saves

| Hàm | Params | Mô tả |
|---|---|---|
| `savePost(postId, userId)` | strings | Tạo document trong `saves` |
| `deleteSavedPost(savedRecordId)` | string | Xóa document khỏi `saves` |
| `getSavedPosts(userId)` | string | Tất cả saves của 1 user |
| `getUserLikedPosts(userId)` | string | Bài user đã like (từ `posts.likes`) |

#### Files / Storage

| Hàm | Params | Mô tả |
|---|---|---|
| `uploadFile(file)` | File | Upload 1 file lên Storage bucket |
| `getFilePreview(fileId)` | string | URL preview (ảnh có transform) |
| `getFileViewUrl(fileId)` | string | URL view trực tiếp (video, PDF, docs) |
| `getMediaCategory(mimeType)` | string | Map MIME → `image`/`video`/`pdf`/`word`/`excel`/`ppt` |
| `deleteFile(fileId)` | string | Xóa file khỏi Storage |

#### Comments

| Hàm | Params | Mô tả |
|---|---|---|
| `createComment(data)` | object | Tạo document trong `comments` |
| `getPostComments(postId)` | string | Tất cả comments của 1 bài |
| `deleteComment(commentId)` | string | Xóa comment (chủ sở hữu) |
| `getUserComments(userId)` | string | Comments của user (activity log) |

#### Notifications

| Hàm | Params | Mô tả |
|---|---|---|
| `createNotification(notif)` | `INewNotification` | Tạo thông báo (silent fail nếu collection chưa tồn tại) |
| `getNotifications(userId)` | string | Tất cả notifications của user (50 mới nhất) |
| `markNotificationRead(id, userId)` | strings | Đánh dấu 1 notification đã đọc |
| `markAllNotificationsRead(userId)` | string | Đánh dấu tất cả đã đọc |

#### Blocks

| Hàm | Params | Mô tả |
|---|---|---|
| `blockUser(blockerId, blockedId, name)` | strings | Tạo document trong `blocks` |
| `unblockUser(blockDocId)` | string | Xóa document khỏi `blocks` |
| `getBlockedUsers(blockerId)` | string | Danh sách đã chặn |

---

### React Query Hooks (`queriesAndMutations.ts`)

```typescript
// Users
useGetUserById(userId)
useGetAllUsers(limit?)
useGetUsersPaginated(page, limit)
useSearchUsers(searchTerm)
useUpdateUser()
useUpdateUserPrivacy()
useGetAccountSessions()

// Posts
useGetRecentPosts()
useGetInfinitePosts()
useGetPostById(postId)
useGetUserPosts(userId)
useGetUserPostsPaginated(userId, page, limit)
useCreatePost()
useUpdatePost()
useDeletePost()
useLikePost()
useSearchPosts(searchTerm)

// Saves
useSavePost()
useDeleteSavedPost()
useGetSavedPosts(userId)
useGetUserLikedPosts(userId)

// Comments
useCreateComment()
useGetPostComments(postId)
useDeleteComment()
useGetUserComments(userId)

// Notifications
useCreateNotification()
useGetNotifications(userId)
useMarkNotificationRead()
useMarkAllNotificationsRead()

// Blocks
useBlockUser()
useUnblockUser()
useGetBlockedUsers(userId)
```

---

## 11. Cấu trúc thư mục

```
myIU/
├── README.md
├── backend/
│   ├── .env                              ← Biến môi trường (KHÔNG commit)
│   ├── appSettings.js                    ← Build MSAL config từ .env
│   ├── package.json
│   └── src/
│       ├── app.js                        ← Express entry
│       ├── router.js                     ← Route definitions
│       ├── controller.js                 ← API handlers
│       ├── msal-express-wrapper/
│       │   ├── auth-provider.js
│       │   ├── config.js
│       │   ├── tokens.js
│       │   └── errors.js
│       ├── utils/
│       │   ├── cachePlugin.js            ← Token cache → file
│       │   └── fetchManager.js           ← HTTP client + retry
│       └── data/
│           └── cache.json                ← Token cache runtime (KHÔNG commit)
│
└── frontend/
    ├── .env                              ← Biến môi trường (KHÔNG commit)
    ├── vite.config.ts                    ← Proxy /auth/* /api/* → :8080
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.tsx                       ← Router + routes
        ├── main.tsx                      ← Entry: QueryClient + ThemeProvider + AuthProvider
        ├── globals.css                   ← Tailwind base + dark mode overrides
        ├── i18n.ts                       ← i18next config (EN/VI, localStorage persist)
        ├── types/
        │   └── index.ts                  ← TypeScript types toàn bộ
        ├── context/
        │   ├── AuthContext.tsx           ← Auth state + backend API calls
        │   └── ThemeContext.tsx          ← Dark/light theme + localStorage persist
        ├── hooks/
        │   └── useDebounce.ts            ← Debounce hook (search)
        ├── locales/
        │   ├── en.json                   ← Bản dịch tiếng Anh (đầy đủ)
        │   └── vi.json                   ← Bản dịch tiếng Việt (đầy đủ)
        ├── lib/
        │   ├── appwrite/
        │   │   ├── config.ts             ← Appwrite Client init
        │   │   └── api.ts                ← Tất cả CRUD + upload functions
        │   ├── msal/
        │   │   └── config.ts             ← MSAL PublicClientApplication
        │   ├── react-query/
        │   │   └── queriesAndMutations.ts ← Tất cả React Query hooks (30+ hooks)
        │   ├── utils.ts                  ← cn(), formatTimeAgo(), getInitials()
        │   └── validation/
        │       └── index.ts              ← Zod schemas
        ├── components/
        │   ├── shared/
        │   │   ├── Topbar.tsx            ← Header: logo, notif bell, lang/theme, signout
        │   │   ├── LeftSidebar.tsx       ← Navigation + unread badge + user footer
        │   │   ├── PostCard.tsx          ← Card bài: multi-media grid, like/save, dark mode
        │   │   ├── MediaUploader.tsx     ← Multi-file uploader (ảnh/video/PDF/Word/Excel/PPT)
        │   │   ├── FileUploader.tsx      ← Single image uploader (EditPost, UpdateProfile)
        │   │   ├── GridPostList.tsx      ← Grid thumbnail cho Explore/Profile
        │   │   ├── MentionInput.tsx      ← Textarea với @mention autocomplete
        │   │   ├── CommentSection.tsx    ← Comments của PostDetails
        │   │   ├── NotificationBell.tsx  ← Bell icon + dropdown + Realtime
        │   │   ├── LanguageSwitcher.tsx  ← Dropdown chọn ngôn ngữ (Topbar)
        │   │   ├── Paginator.tsx         ← Pagination component
        │   │   ├── Loader.tsx            ← Spinner
        │   │   └── index.ts              ← Barrel exports
        │   └── ui/                       ← Shadcn primitives (button, form, toast...)
        ├── _auth/
        │   ├── AuthLayout.tsx            ← Split layout (isolated từ dark mode)
        │   └── forms/
        │       ├── SignInForm.tsx
        │       ├── SignUpForm.tsx
        │       └── ForgotPassword.tsx
        └── _root/
            ├── RootLayout.tsx            ← Auth guard + Topbar + Sidebar + Outlet
            └── pages/
                ├── Home.tsx              ← Dashboard (dark mode + i18n)
                ├── Explore.tsx           ← Feed + search + toggle (dark mode + i18n)
                ├── CreatePost.tsx        ← Tạo bài với MediaUploader (dark mode + i18n)
                ├── EditPost.tsx          ← Sửa bài (dark mode + i18n)
                ├── PostDetails.tsx       ← Chi tiết bài đăng (dark mode)
                ├── Saved.tsx             ← Bài đã lưu (dark mode + i18n)
                ├── AllUsers.tsx          ← Danh bạ (dark mode + i18n)
                ├── Profile.tsx           ← Hồ sơ cá nhân (dark mode + i18n)
                ├── UpdateProfile.tsx     ← Chỉnh sửa hồ sơ
                ├── Notifications.tsx     ← Trang thông báo (dark mode + i18n)
                ├── Settings.tsx          ← Cài đặt 4 tabs (dark mode + i18n)
                └── Tenant.tsx            ← Azure tenant info (dark mode + i18n)
```

---

## 12. Roadmap — Cần làm tiếp

### 🔴 Bắt buộc làm ngay (trước khi test)

1. **Appwrite Console** — Thêm 3 attributes vào collection `posts`:
   ```
   mediaUrls   → String Array, max 10 items, size 2048/item
   mediaIds    → String Array, max 10 items, size 36/item
   mediaTypes  → String Array, max 10 items, size 20/item
   ```

2. **Appwrite Console** — Nếu chưa có, tạo 3 collections:
   `notifications`, `comments`, `blocks` theo schema ở [Phần 6](#6-appwrite--schema-database-đầy-đủ)

3. **`frontend/.env`** — Điền IDs của các collections vừa tạo

4. **Storage bucket** — Mở rộng allowed extensions thêm video + documents (xem [Phần 6 Storage](#storage-bucket-media))

### 🟡 Cải thiện ngắn hạn

- [ ] **Like notification từ Explore/Home** — hiện chỉ trigger từ PostDetails
- [ ] **EditPost** — dùng `MediaUploader` thay `FileUploader` để hỗ trợ multi-file khi sửa
- [ ] **PostDetails** — hiển thị tất cả media (carousel/scrollable) thay vì chỉ 1 ảnh
- [ ] **@mention clickable** — click `@username` trong caption/comment → navigate `/profile/:id`
- [ ] **Profile** — nút "Chặn người dùng" trên profile của người khác
- [ ] **Like notification** — chỉ gửi notification 1 lần (debounce hoặc check đã like trước đó)
- [ ] **PostCard dark mode** — dropdown menu khi edit/delete chưa có dark background

### 🟢 Tính năng mới (Phase 4)

#### Hệ thống Workflow / Xử lý đơn từ

Số hóa quy trình xin phép, cấp giấy tờ, phê duyệt nội bộ.

**Collections Appwrite cần thêm:**
```
requestTypes    { id, name, fields: JSON, approvalFlow: JSON }
requests        { typeId, submittedBy, status, data: JSON, $createdAt }
requestHistory  { requestId, actor, action, comment, $createdAt }
```

**Backend endpoints cần thêm:**
```
POST /api/requests              ← Tạo yêu cầu + trigger Power Automate webhook
GET  /api/requests              ← Danh sách yêu cầu của user đang đăng nhập
GET  /api/requests/:id          ← Chi tiết + lịch sử phê duyệt
POST /api/requests/:id/callback ← Webhook từ Power Automate (cập nhật status)
```

**Frontend pages cần thêm:**
```
/requests          ← "Yêu cầu của tôi" + badge trạng thái
/requests/new      ← Form động dựa trên requestTypes.fields
/requests/:id      ← Timeline phê duyệt
/approvals         ← "Cần tôi duyệt" (cho manager)
```

#### Admin Dashboard (Phase 5)

- [ ] Dashboard thống kê: tổng users, posts, requests theo ngày/tuần
- [ ] Quản lý user: vô hiệu hóa account, thay đổi role
- [ ] Ẩn/hiện menu theo role (student/staff/admin)
- [ ] Xuất dữ liệu ra Excel/PDF
- [ ] Sơ đồ tổ chức từ Azure AD `manager`/`directReports` attributes

---

## 13. Xử lý sự cố

#### Backend không khởi động
```
Error: Cannot find module '../appSettings'
```
→ Chạy `npm install` **bên trong** thư mục `backend/`, không phải thư mục gốc.

---

#### Frontend báo "Failed to fetch" khi gọi `/api/user`
→ Backend chưa chạy → `cd backend && npm start`  
→ Kiểm tra `vite.config.ts` proxy target là `http://localhost:8080`  
→ Kiểm tra `VITE_OAUTH_BACKEND_URL=http://localhost:5173` (không phải 8080)

---

#### Vòng lặp redirect OAuth
→ `REDIRECT_URI` backend phải khớp **chính xác** với URI trên Azure App Registration  
→ Không có dấu `/` cuối: `http://localhost:5173/redirect` ✅ (không phải `.../redirect/`)  
→ `FRONTEND_ORIGIN` cũng không có dấu `/` cuối

---

#### Appwrite báo "Collection not found"
→ Tạo collection với ID **khớp chính xác** giá trị trong `frontend/.env`  
→ Permissions: `read("any")` + `write("users")` hoặc theo từng collection ở [Phần 6](#6-appwrite--schema-database-đầy-đủ)

---

#### `createPost` lỗi sau khi thêm MediaUploader
```
AppwriteException: Attribute "mediaUrls" not found
```
→ Vào Appwrite Console → Collection `posts` → Attributes → thêm `mediaUrls`, `mediaIds`, `mediaTypes`  
→ Xem spec đầy đủ ở [Phần 6 Collection posts](#collection-posts)

---

#### Upload file không thành công (video/PDF)
→ Kiểm tra file size ≤ 50 MB  
→ Kiểm tra Storage bucket allowed extensions (thêm `mp4`, `pdf`, `docx`, v.v.)  
→ Permissions bucket phải có `create("users")`

---

#### Dark mode ảnh hưởng trang sign-in
→ Đã fix: `AuthLayout.tsx` dùng `useEffect` để xóa class `dark` khi mount và khôi phục khi unmount.

---

#### MS Identity section hiện cho local account
→ Đã fix: Section chỉ render khi `appwriteUser?.authProvider === 'microsoft'`  
→ `AuthContext.getBackendProfile()` không còn auto-redirect local users sang MSAL login

---

#### Token cache lỗi / xác thực không nhận
→ Xóa `backend/src/data/cache.json` để reset token cache  
→ User cần đăng nhập lại sau khi xóa

---

## 14. Triển khai Production

### Biến môi trường cần cập nhật

```env
# backend/.env
REDIRECT_URI=https://yourdomain.com/redirect
FRONTEND_ORIGIN=https://yourdomain.com
BASE_URI_LOCAL=https://yourdomain.com
SESSION_SECRET=<chuoi-ngau-nhien-manh-it-nhat-64-ky-tu>

# frontend/.env
VITE_APPWRITE_URL=https://your-appwrite-instance/v1
VITE_REDIRECT_URI=https://yourdomain.com/redirect
VITE_OAUTH_BACKEND_URL=https://your-backend-domain.com
```

### Checklist trước khi go-live

- [ ] `SESSION_SECRET` ≥ 32 ký tự ngẫu nhiên
- [ ] Bật `cookie: { secure: true, sameSite: 'strict' }` trong `backend/src/app.js`
- [ ] Thêm redirect URI production vào Azure App Registration
- [ ] `FRONTEND_ORIGIN` là URL frontend production (không có `/` cuối)
- [ ] Toàn bộ traffic qua HTTPS
- [ ] Không commit `.env` và `cache.json` (thêm vào `.gitignore`)
- [ ] PM2 hoặc systemd auto-restart backend khi crash
- [ ] Storage bucket permissions được audit lại
- [ ] Appwrite backup schedule được bật

### Hosting đề xuất

| Dịch vụ | Dùng cho | Ghi chú |
|---|---|---|
| **Azure App Service** | Backend Node.js | Tích hợp sẵn với Azure AD, dễ setup |
| **Azure Static Web Apps** | Frontend Vite build | Free tier, CI/CD từ GitHub |
| **Appwrite Cloud** | Database + Storage | Dễ nhất, không cần quản lý server |
| **Railway / Render** | Backend (alternative) | Rẻ hơn Azure nếu không cần Azure integration |
| **Docker self-host** | Cả Appwrite + Backend | Toàn quyền kiểm soát, cần DevOps |

---

*Cập nhật: Phase 1 + Phase 2 + Phase 3 (Dark mode, i18n EN/VI, Multi-media upload, Settings đầy đủ) hoàn thành.*  
*Milestone tiếp theo: Phase 4 — Workflow & Xử lý đơn từ nội bộ.*
