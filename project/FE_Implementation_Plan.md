# 🖥️ FRONTEND IMPLEMENTATION PLAN — AI CONTENT STUDIO
**Tech Stack:** React 18 · Vite · Tailwind CSS · Shadcn UI · Zustand · TanStack Query · Axios · React Hook Form + Zod  
**Architecture:** Feature-driven · Container/Presentational Pattern  
**Package root:** `ai-content-studio-fe`

---

## 📐 PHASE 0 — PROJECT BOOTSTRAP & INFRASTRUCTURE
> **Mục tiêu:** Dựng bộ khung chuẩn, Axios interceptor với Auth flow tự động, Protected Routes hoạt động.  
> **Output:** App chạy được, cấu trúc thư mục sạch, Axios + Zustand + TanStack Query đã wired up.

---

### 0.1 Khởi tạo project

```bash
npm create vite@latest ai-content-studio-fe -- --template react
cd ai-content-studio-fe
npx shadcn@latest init
```

**Dependencies:**

| Nhóm | Packages |
|---|---|
| Routing | `react-router-dom` |
| HTTP | `axios` |
| Server State | `@tanstack/react-query` |
| Client State | `zustand` |
| Form & Validation | `react-hook-form` `zod` `@hookform/resolvers` |
| UI | `lucide-react` `clsx` `tailwind-merge` `class-variance-authority` |
| Editor | `react-quill` |
| Export | `html-to-image` |
| Chart | `recharts` |
| Utilities | `lodash` `date-fns` |

---

### 0.2 Biến môi trường

**`.env.local` (dev):**
```
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

**`.env.production`:**
```
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

> ⚠️ Tất cả biến Vite phải prefix `VITE_`. Không commit `.env.local` lên Git.

---

### 0.3 Cấu trúc thư mục

```
src/
├── assets/
├── components/
│   ├── ui/                    # Shadcn auto-generated
│   ├── common/                # AppSpinner, AppToast, ConfirmDialog, EmptyState
│   └── layout/                # MainLayout, AuthLayout, Sidebar, Topbar
├── features/
│   ├── landing/               # LandingPage và các section (Hero, Features, CTA)
│   ├── auth/
│   │   ├── components/        # LoginForm, RegisterForm, ChangePasswordForm
│   │   └── pages/             # LoginPage, RegisterPage
│   ├── dashboard/
│   │   ├── components/        # StatsCard, RecentActivityList, MonthlyUsageBar
│   │   └── pages/             # UserDashboardPage
│   ├── campaign/
│   │   ├── components/        # CampaignCard, CampaignForm, StatusBadge
│   │   └── pages/             # CampaignListPage
│   ├── content/
│   │   ├── components/        # GenerateForm, ContentEditor, SeoSidebar, BannerPreview
│   │   └── pages/             # ContentListPage, EditorPage
│   └── admin/
│       ├── components/        # UserTable, CampaignMonitorTable, AiUsageChart, ContentModerationTable
│       └── pages/             # AdminDashboardPage, AdminUsersPage, AdminCampaignsPage, AdminContentsPage
├── hooks/
│   ├── useAuth.js
│   ├── useInitAuth.js         # Khôi phục session khi F5
│   ├── useSeoAnalyzer.js
│   └── useBannerExport.js
├── services/
│   ├── axiosInstance.js       # Config + interceptors
│   ├── authService.js
│   ├── campaignService.js
│   ├── contentService.js
│   └── adminService.js
├── store/
│   ├── authStore.js           # accessToken (memory), user info
│   └── uiStore.js
├── routes/
│   ├── AppRouter.jsx
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
├── constants/
│   ├── queryKeys.js
│   ├── apiRoutes.js
│   ├── platforms.js           # ['Facebook', 'Instagram', 'Website', 'Email']
│   └── tones.js               # ['Professional', 'Funny', 'Persuasive', ...]
├── utils/
│   ├── seoCalculator.js       # Pure function — không phải React
│   ├── formatDate.js
│   └── cn.js
└── App.jsx
```

---

### 0.4 Zustand Stores

**`authStore.js`:**
- State: `accessToken: string | null`, `user: { id, email, fullName, roles[] } | null`
- Actions: `setAccessToken()`, `setUser()`, `clearAuth()`
- **KHÔNG lưu vào `localStorage`** — token chỉ tồn tại trong memory

**`uiStore.js`:**
- State: `isSidebarCollapsed: boolean`, `theme: 'light' | 'dark'`
- Actions: `toggleSidebar()`, `setTheme(mode)`, `toggleTheme()`
- Persistence: `theme` nên được lưu vào `localStorage`

---

### 0.5 TanStack Query Setup

**`constants/queryKeys.js` — Key Factory pattern:**
```
campaigns.all, campaigns.detail(id), campaigns.list(filters)
contents.byCampaign(campaignId), contents.detail(id)
dashboard.user
admin.users(filters), admin.campaigns(filters)
admin.aiStats(dateRange), admin.topUsers, admin.recentContents
```

**`main.jsx`:** Wrap App với `QueryClientProvider`:
- `staleTime: 1000 * 60 * 5` (5 phút)
- `retry: 1`
- `refetchOnWindowFocus: false`

---

### 0.6 Axios Instance + Interceptors

**Config:**
- `baseURL`: `import.meta.env.VITE_API_BASE_URL`
- `withCredentials: true` — **bắt buộc** để HttpOnly Cookie tự động gửi kèm

**Request Interceptor:** đọc `accessToken` từ Zustand → gắn `Authorization: Bearer <token>`

**Response Interceptor (401 Handler):**
1. Nhận 401 → kiểm tra `isRefreshing` flag
2. Nếu chưa refresh: set `isRefreshing = true` → gọi `POST /auth/refresh`
3. Các request 401 khác: đẩy vào `failedQueue` chờ
4. Refresh thành công: cập nhật store → drain queue → retry request gốc
5. Refresh thất bại: `clearAuth()` → redirect `/login` → clear queue

> ⚠️ `isRefreshing` + `failedQueue` là bắt buộc để tránh gọi `/auth/refresh` nhiều lần đồng thời.

---

### 0.7 Route Structure

```
AppRouter
├── /                    → LandingPage (public — hiển thị cho Guest)
│                          Nếu đã login → redirect /dashboard
├── /login               → LoginPage (public)
├── /register            → RegisterPage (public)
├── <ProtectedRoute>     → check accessToken trong store
│   ├── /dashboard       → UserDashboardPage
│   ├── /campaigns       → CampaignListPage
│   ├── /campaigns/:id   → CampaignDetailPage
│   └── /editor/:id      → EditorPage
└── <AdminRoute>         → check roles.includes('ROLE_ADMIN')
    ├── /admin           → AdminDashboardPage
    ├── /admin/users     → AdminUsersPage
    ├── /admin/campaigns → AdminCampaignsPage     ← bổ sung mới
    └── /admin/contents  → AdminContentsPage
```

---

### 0.8 Design System & Theming (Standard Sản xuất)

Tuân thủ bộ tokens sau để đảm bảo UI/UX cao cấp:

**A. Tailwind Configuration (`tailwind.config.js`):**
```javascript
theme: {
  extend: {
    colors: {
      brand: {
        primary:   '#4F46E5', // indigo-600
        secondary: '#8B5CF6', // violet-500
      },
      surface: {
        light: '#F8FAFC', // slate-50 (mặc định)
        dark:  '#020617', // slate-950 (nền chính Dark mode)
      }
    }
  }
}
```

**B. Quy tắc Gradient:**
- **Sử dụng:** Logo, Hero Headline, Main CTA (Landing Page), Badge "AI Generated".
- **KHÔNG sử dụng:** Table rows, Sidebar links, Form inputs, Secondary buttons.
- **Giá trị:** `from-brand-primary to-brand-secondary`.

**C. Phân cấp Màu sắc (Typography & Neutral Palette):**
- **Heading:** `text-slate-900` (Light) / `text-white` (Dark).
- **Body:** `text-slate-600` (Light) / `text-slate-300` (Dark).
- **Border:** `border-slate-200` (Light) / `border-slate-800` (Dark).

**D. SEO Badge System (Soft Palette):**
Giao diện chấm điểm SEO dùng tổ hợp `Bg nhạt + Border + Text đậm` để hài hòa:

| Trạng thái | Text | Background | Border |
|---|---|---|---|
| Tốt (≥70) | `green-700` | `green-50` | `green-200` |
| Cần cải thiện (40-69) | `yellow-700` | `yellow-50` | `yellow-200` |
| Kém (<40) | `red-700` | `red-50` | `red-200` |
| Chưa phân tích | `slate-500` | `slate-100` | `slate-200` |

---

## 🏠 PHASE 0.5 — LANDING PAGE
> **Mục tiêu:** Trang giới thiệu sản phẩm cho Guest theo yêu cầu PRD.  
> **Output:** Landing Page responsive, đủ 4 USPs, CTA điều hướng đăng ký/đăng nhập.

---

### Sections & Nội dung

| Section | Nội dung |
|---|---|
| **Navbar** | Logo · nút "Đăng nhập" → `/login` · nút "Bắt đầu miễn phí" → `/register` |
| **Hero** | Headline · Tagline · 2 CTA buttons · (optional) screenshot/mockup sản phẩm |
| **USP 1** | Workflow-Centric Prompt — Form thay vì tự viết Prompt |
| **USP 2** | Real-time SEO Analyzer — Chấm điểm ngay trong Editor |
| **USP 3** | Dynamic Banner Preview — Xem trước quảng cáo không cần Canva |
| **USP 4** | Enterprise-Ready — Phân quyền Admin/User, lịch sử theo Campaign |
| **CTA Bottom** | "Bắt đầu ngay hôm nay" → `/register` |
| **Footer** | Links: Login · Register · (optional) GitHub repo |

**Kỹ thuật:**
- Hoàn toàn static, không gọi API
- Responsive mobile-first với Tailwind
- Nếu user đã đăng nhập và vào `/` → redirect `/dashboard`

---

## 🔐 PHASE 1 — AUTHENTICATION
> **Mục tiêu:** Đăng ký, đăng nhập, refresh khi F5, logout hoạt động.  
> **Output:** Auth flow hoàn chỉnh, session khôi phục sau reload.

---

### 1.1 `useInitAuth` Hook

Gọi **một lần** trong `App.jsx` khi mount để khôi phục session sau F5:
1. Gọi `POST /auth/refresh` (RT tự gửi qua Cookie)
2. Thành công → `setAccessToken()` + `GET /auth/me` → `setUser()`
3. Thất bại → `clearAuth()`
4. Trong lúc chờ → full-screen spinner, block render routes

---

### 1.2 Login Form

**Validation (Zod):** `email` (required, email format) · `password` (required, min 8)

**Submit flow:**
1. `POST /auth/login` → nhận `{ access_token, expires_in }`
2. `setAccessToken()` → `GET /auth/me` → `setUser()`
3. Redirect `/dashboard` hoặc `state.from`

---

### 1.3 Register Form

**Validation (Zod):** `full_name` (min 2) · `email` · `password` (min 8) · `confirm_password` (must match)

**Submit:** `POST /auth/register` → tự động login → redirect `/dashboard`

---

### 1.4 Logout

`POST /auth/logout` → `clearAuth()` → redirect `/login`

---

### 1.5 Change Password

**HTTP Method:** `PATCH /auth/change-password` (Đã xác nhận ở BE)

**Request body:** `{ old_password, new_password, confirm_new_password }`

---

## 📂 PHASE 2 — CAMPAIGN MANAGEMENT
> **Mục tiêu:** CRUD Campaign với TanStack Query, pagination, filter theo status.  
> **Output:** User tạo/sửa/xóa campaign, danh sách cập nhật real-time sau mutation.

---

### 2.1 Campaign List Page

**API:** `GET /api/v1/campaigns?status={status}&page={page}&size=10&sort=createdAt,desc`

**Features:** Card grid responsive · filter tabs (All/Active/Archived/Draft) · pagination · skeleton loading · empty state

---

### 2.2 Campaign Form (Create & Edit)

**Request body:**

| Field | Validation | Lưu ý |
|---|---|---|
| `name` | required, 3–100 ký tự | |
| `status` | required: `DRAFT`/`ACTIVE`/`ARCHIVED` | |
| `metadata.goal` | optional | |
| `metadata.target_audience` | optional | **snake_case** |

> ⚠️ Toàn bộ field gửi lên đều dùng **snake_case** — BE config `SnakeCaseStrategy` globally.

Dùng chung 1 component cho Create và Edit, phân biệt qua prop `campaignId`.

---

### 2.3 User Dashboard

**API:** `GET /api/v1/dashboard/user`

**UI — 3 nhóm:**

**Stats Cards:** Tổng campaigns · Tổng contents · Quick Action "Tạo Content Mới"

**Recent Activity:** Danh sách 5 contents gần nhất — keyword · campaign name · status badge · thời gian relative · link "Xem tất cả"

**Monthly Usage:** Thanh progress bar hoặc số tuyệt đối token đã dùng trong tháng để user tự theo dõi quota.

> Cần confirm với BE response shape của `GET /dashboard/user` có trả đủ 3 nhóm data trên không.

---

## 🧠 PHASE 3 — AI CONTENT GENERATION & EDITOR
> **Mục tiêu:** Generate form → AI sinh text → Editor → SEO Sidebar → Save.  
> **Output:** Generate flow end-to-end, SEO scoring real-time với Meta fields, Save đúng contract.

---

### 3.1 Generate Content Form

**Fields:**

| Field | UI | Validation |
|---|---|---|
| `campaign_id` | Select (load từ `/campaigns`) | required |
| `keyword` | Text input | required |
| `platform` | Select từ `constants/platforms.js` | required |
| `tone` | Select từ `constants/tones.js` | required |
| `length_limit` | Select: Short/Medium/Long | optional |

**Generate flow (Synchronous — MVP):**
1. Submit → overlay "AI đang tạo nội dung..." + spinner
2. `POST /api/v1/contents/generate`
3. Nhận response → đẩy `generated_text` vào Editor
4. `seo_metadata = null` → trigger `useSeoAnalyzer` → hiển thị điểm trên UI (không gửi DB)
5. Tắt overlay → scroll xuống Editor

> 📌 **Lưu ý Streaming:** PRD yêu cầu SSE Streaming nhưng BE hiện tại là Synchronous. Plan này theo Synchronous để khớp BE. Khi BE nâng cấp lên SSE, FE chỉ cần thay `axios.post` bằng `EventSource` — không ảnh hưởng các phase khác.

---

### 3.2 EditorPage Layout

```
[Meta Title input]         ← field riêng, max 60 ký tự, character counter
[Meta Description input]   ← textarea riêng, max 160 ký tự, character counter
[Quill Editor]             ← nội dung bài viết HTML
[SEO Sidebar]              ← real-time, cập nhật khi bất kỳ field trên thay đổi
```

> Meta Title và Meta Description là **2 input field riêng biệt** ngoài Editor vì Quill chỉ sinh HTML nội dung, không sinh meta tags.

---

### 3.3 Rich Text Editor (Quill)

**Toolbar:** Bold · Italic · Underline · H1 · H2 · H3 · Bullet List · Numbered List · Link

Khi content thay đổi → `onContentChange(htmlString)` → parent debounce 500ms → `useSeoAnalyzer`

---

### 3.4 `seoCalculator.js` — Pure Function

**Input:** `{ htmlContent, keyword, metaTitle, metaDescription }`

**6 tiêu chí:**

| Tiêu chí | Cách tính | Điểm |
|---|---|---|
| Keyword trong H1 | `DOMParser → h1.textContent.includes(keyword)` | 20 |
| Keyword density 1–3% | `(count/totalWords)*100` | 20 |
| Có ≥ 2 thẻ H2 | `querySelectorAll('h2').length >= 2` | 15 |
| Độ dài ≥ 300 từ | `text.split(/\s+/).length` | 15 |
| Meta Title 50–60 ký tự + có keyword | check length + includes | 15 |
| Meta Description 120–160 ký tự + có keyword | check length + includes | 15 |

**Return — toàn bộ snake_case để nhất quán khi gửi lên BE:**
```
{ score, keyword_density, has_h1, has_h2, word_count,
  meta_title_valid, meta_description_valid, suggestions: string[] }
```

---

### 3.5 `useSeoAnalyzer.js` Hook

- Input: `{ htmlContent, keyword, metaTitle, metaDescription }`
- `useCallback` + `lodash.debounce` 500ms
- Return `null` nếu `htmlContent` rỗng
- Cleanup debounce khi unmount

---

### 3.6 SEO Sidebar UI

**Hiển thị:** Badge trạng thái · Score / 100 · Progress bar · checklist tiêu chí · suggestions

**Badge:** `null` → xám "Chưa phân tích" | `≥70` → xanh | `40–69` → vàng | `<40` → đỏ

---

### 3.7 Save Content — Explicit Save

`PUT /api/v1/contents/{id}` — body toàn bộ snake_case:

```
{
  generated_text,
  seo_metadata: {
    score, keyword_density, has_h1, has_h2, word_count,
    meta_title, meta_description,
    meta_title_valid, meta_description_valid,
    suggestions: ["..."]
  }
}
```

- Gửi `generated_text` và `seo_metadata` trong **cùng 1 request**
- Nếu `useSeoAnalyzer` trả `null` → gửi `seo_metadata: null`

> ✅ **Xác nhận từ BE:** `meta_title` và `meta_description` được lưu trực tiếp trong trường `seo_metadata` (JSONB) của bảng `contents`.

---

### 3.8 Content List Page

**API:** `GET /api/v1/contents?campaignId={id}&page=0&size=10&sort=createdAt,desc`

> ⚠️ Dùng query param `?campaignId=` — không phải nested route.

**Soft Delete:** `DELETE /api/v1/contents/{id}` → confirm dialog → invalidate query.

---

## 🎨 PHASE 4 — BANNER PREVIEW & EXPORT
> **Output:** Banner preview hoạt động, upload Cloudinary thành công, `banner_url` được persist.

---

### 4.1 BannerPreview Component

**2 templates:** `feed` (1:1) · `story` (9:16)

**Data binding:** Headline từ `<h1>` đầu tiên · Subtext từ `<p>` đầu tiên (truncate 120 ký tự)

Dùng `ref={bannerRef}` cho `html-to-image`.

---

### 4.2 `useBannerExport.js` Hook

**Flow `exportAndSave(bannerRef, contentId)`:**
1. `toPng(bannerRef.current)` → data URL → Blob
2. Upload Cloudinary: `POST https://api.cloudinary.com/v1_1/{cloudName}/image/upload` với `FormData { file, upload_preset }`
3. Nhận `secure_url`
4. `PUT /api/v1/contents/{id}/banner` với `{ banner_url: secure_url }`
5. Trigger download về máy

**Return:** `{ isExporting, exportAndSave }`

---

## 👑 PHASE 5 — ADMIN PANEL
> **Output:** Admin có đủ tools quản trị, mọi action nhạy cảm có confirm + reason + audit trail.

---

### 5.1 Admin Sidebar

Links: Dashboard · Users · Campaigns · Contents · AI Usage

---

### 5.2 User Management

**API:** `GET /api/v1/admin/users?email=&status=&page=0&size=20`

- Search email (debounce 300ms) · filter status tabs
- `PATCH /api/v1/admin/users/{id}/status` với `{ status, reason }` — confirm dialog + reason required
- Disable button nếu `row.id === currentUser.id`

---

### 5.3 Campaign Monitor *(Bổ sung mới)*

**API:** `GET /api/v1/admin/campaigns?page=0&size=20&sort=createdAt,desc`

**Table:** Campaign name · Owner email · Status · Số contents · Created at

Admin chỉ xem (read-only), không edit/delete campaign của user khác.

---

### 5.4 Content Moderation

**API:** `GET /api/v1/admin/contents/recent` → 50 nội dung mới nhất

**Hard Delete:** `DELETE /api/v1/admin/contents/{id}` → confirm dialog + reason required → BE ghi `admin_audit_logs`

---

### 5.5 AI Usage Dashboard

**APIs:** `GET /admin/stats/ai-usage?startDate=&endDate=` · `GET /admin/stats/top-users`

**UI:** Date range picker · BarChart (Recharts) total_tokens theo ngày · Top 10 users table với medal icon top 3

---

## 🚢 PHASE 6 — BUILD & DEPLOY
> **Output:** App chạy trên internet, kết nối BE trên Render, auto-deploy từ GitHub.

---

### 6.1 `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

> Bắt buộc — không có file này, F5 ở bất kỳ route nào trả 404.

---

### 6.2 Deploy Vercel

```
GitHub push → Vercel import repo → Framework: Vite → Build: npm run build
→ Output: dist → Set env vars → Deploy
```

Auto-deploy mỗi lần push lên `main`.

---

### 6.3 CORS Checklist — Phía BE

Confirm BE đã config trong `SecurityConfig` trước khi go-live:

```
allowedOrigins:   https://your-app.vercel.app
allowedMethods:   GET, POST, PUT, PATCH, DELETE, OPTIONS
allowedHeaders:   Authorization, Content-Type
allowCredentials: true    ← bắt buộc cho Cookie
exposedHeaders:   Set-Cookie
```

---

## 📊 TỔNG QUAN PHASES & TIMELINE

```
PHASE 0 → 0.5 → PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5 → PHASE 6
Bootstrap  Landing  Auth    Campaign   AI+Editor  Banner    Admin     Deploy
2-3 ngày   1 ngày   2 ngày  2-3 ngày   3-4 ngày   1-2 ngày  2-3 ngày  1 ngày
```

**Tổng ước tính: 14–19 ngày.**

---

## ⚠️ GOTCHAS — Lỗi phổ biến cần tránh

| # | Lỗi | Cách tránh |
|---|---|---|
| 1 | Lưu Access Token vào `localStorage` | Chỉ lưu trong Zustand memory |
| 2 | Quên `withCredentials: true` | Cookie không gửi → Refresh Token thất bại |
| 3 | Không dùng `isRefreshing` flag | Race condition khi nhiều request cùng 401 |
| 4 | Không có `useInitAuth` | User bị logout mỗi lần F5 |
| 5 | SEO analyzer chạy mỗi keystroke | Debounce 500ms bắt buộc |
| 6 | Render `score = 0` thay vì "Chưa phân tích" | Check `seo_metadata === null` trước khi render |
| 7 | Gửi `seo_metadata` riêng không kèm `generated_text` | Gửi cả 2 trong 1 `PUT /contents/{id}` |
| 8 | Gửi camelCase thay vì snake_case | Tất cả field gửi lên đều snake_case |
| 9 | Admin self-lock | Disable button nếu `row.id === currentUser.id` |
| 10 | Quên `vercel.json` | F5 ở bất kỳ route nào trả 404 |
| 11 | BE thiếu `allowCredentials(true)` CORS | Cookie không gửi được trên production |
| 12 | Upload banner qua BE | Upload thẳng Cloudinary unsigned preset từ FE |
| 13 | `useSeoAnalyzer` thiếu meta inputs | Hook nhận đủ 4: `htmlContent`, `keyword`, `metaTitle`, `metaDescription` |
| 14 | Route `/` redirect thẳng dashboard | Guest chưa login phải thấy Landing Page |
| 15 | `change-password` method sai | Đã xác nhận dùng `PATCH` ở BE |
