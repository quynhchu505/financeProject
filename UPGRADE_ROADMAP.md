# Roadmap Nâng cấp Finance Manager

> **Tech stack hiện tại:** React 18 + TypeScript + Vite + Tailwind CSS + lucide-react + recharts/chart.js + react-router-dom v6
> **Backend:** FastAPI (Python) + PostgreSQL
> **Mục tiêu:** Nâng app từ "demo cơ bản" → "ứng dụng web tài chính chuyên nghiệp" đủ sức nặng cho đồ án tốt nghiệp.

---

## 0. Hiện trạng (đã có)

- [x] Layout: Header + Sidebar + Main (responsive)
- [x] Header có Global Search input (chưa có logic), NotificationDropdown (đã wire `api.getAlerts`), UserDropdown (Avatar, Email, Settings, Toggle theme, Toggle ngôn ngữ VI/EN, Đăng xuất)
- [x] Sidebar nhóm: Tổng quan / Quản lý (Giao dịch, Ngân sách, Báo cáo) / Trợ lý AI / Cài đặt
- [x] Trang: Dashboard, Transactions, Budgets, Reports, Chatbot, Settings, Login
- [x] Context: AuthContext, ThemeContext (Dark/Light), i18n (VI/EN)

---

## 1. Tái cấu trúc & Nâng cấp Layout (UI/UX)

### 1.1. Header

| # | Việc cần làm | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Global Search hoạt động thực sự (debounce 300ms, dropdown kết quả: Giao dịch / Danh mục / Ví / Mục tiêu) | [ ] | Tạo `components/GlobalSearch.tsx`, gọi `api.search(q)` mới, hỗ trợ phím tắt `⌘K` / `Ctrl+K` |
| 2 | Bell icon: badge số lượng chưa đọc + group theo loại (Cảnh báo ngân sách / Hóa đơn sắp tới / Mục tiêu đạt được) | [x] phần lớn | Bổ sung nút "Đánh dấu tất cả đã đọc" và filter theo loại |
| 3 | UserDropdown: thêm shortcut "Hồ sơ", "Đổi mật khẩu", link "Trợ giúp", section riêng cho phiên bản app | [ ] | Tách thành sub-component, thêm divider |
| 4 | Breadcrumb dưới Header (ẩn trên Dashboard) | [ ] | `components/Breadcrumb.tsx`, đọc `location.pathname` |
| 5 | Quick-action button "+ Thêm giao dịch" (mở modal) trong header | [ ] | Tăng tốc luồng nhập liệu thường dùng nhất |

### 1.2. Sidebar — bổ sung module

```
TỔNG QUAN
└── Dashboard

QUẢN LÝ TÀI CHÍNH
├── Giao dịch
├── Ví / Tài khoản  ← MỚI (multi-wallet, ngân hàng, tiền mặt, ví điện tử)
├── Danh mục thu/chi  ← MỚI (CRUD category, icon, màu)
├── Ngân sách
└── Mục tiêu tài chính  ← MỚI (Goals: tiết kiệm mua nhà, du lịch...)

PHÂN TÍCH
├── Báo cáo
└── Dự báo dòng tiền  ← MỚI (Cashflow forecast — dùng AI)

TIỆN ÍCH
├── Hóa đơn định kỳ  ← MỚI (Recurring bills)
├── Nhập / Xuất dữ liệu  ← MỚI (CSV/Excel import-export)
└── Trợ lý AI

HỆ THỐNG
└── Cài đặt
```

- [ ] Cập nhật `NAV_GROUPS` trong [Layout.tsx](frontend/src/components/Layout.tsx#L15)
- [ ] Tạo route mới: `/wallets`, `/categories`, `/goals`, `/forecast`, `/recurring`, `/import-export`
- [ ] Sidebar collapsible (chỉ hiện icon) — toggle bằng nút ở footer sidebar
- [ ] Hiển thị badge số lượng (vd: số mục tiêu đang theo dõi, số hóa đơn sắp đến hạn) bên cạnh menu item

### 1.3. Dashboard — chi tiết hơn

- [ ] **Bộ lọc thời gian** chung cho cả trang: Hôm nay / Tuần / Tháng / Quý / Năm / Custom range. Component: `components/PeriodFilter.tsx`
- [ ] **Stat cards** so sánh kỳ trước:
  - Tổng thu / Tổng chi / Tiết kiệm ròng / Số dư hiện tại
  - Mỗi card: số liệu chính + delta `+12.3% so với tháng trước` + sparkline mini
- [ ] **Biểu đồ:**
  - Line chart "Dòng tiền 30 ngày" với 2 đường (thu/chi) + vùng đổ màu
  - Donut chart "Cơ cấu chi tiêu theo danh mục" (top 5 + Khác)
  - Bar chart "So sánh thu chi 6 tháng gần nhất"
  - Heatmap calendar "Mức chi tiêu theo ngày" (theo phong cách GitHub contribution)
- [ ] **Widget bổ sung:**
  - "Top 5 giao dịch lớn nhất tháng"
  - "Tiến độ ngân sách" (progress bar mỗi danh mục)
  - "Mục tiêu sắp đạt" (3 goals gần đích nhất)
  - "Hóa đơn sắp đến hạn 7 ngày tới"
- [ ] **Skeleton loading** thay cho spinner khi fetch data
- [ ] **Empty state** thân thiện cho user mới (CTA "Thêm giao dịch đầu tiên")

---

## 2. Trang Cài đặt & Hồ sơ người dùng

> Cấu trúc: tab dọc bên trái, content bên phải. Áp dụng pattern của GitHub/Linear.

### 2.1. Tab "Hồ sơ cá nhân" (`/settings/profile`)

- [ ] **Avatar:** upload ảnh (preview, crop vuông, lưu vào `/uploads/avatars/`), fallback initials
- [ ] **Thông tin cơ bản:**
  - Họ và tên *(required)*
  - Username (readonly sau khi tạo)
  - Email *(yêu cầu xác thực OTP khi đổi)*
  - Số điện thoại
  - Ngày sinh, Giới tính (optional)
  - Địa chỉ (optional)
- [ ] **Tuỳ chọn cá nhân:**
  - Đơn vị tiền tệ mặc định (VND / USD / EUR…)
  - Múi giờ
  - Ngôn ngữ giao diện
  - Định dạng ngày (`dd/MM/yyyy` vs `MM/dd/yyyy`)
  - Ngày bắt đầu tuần (T2 / CN)
- [ ] Nút "Lưu thay đổi" sticky ở footer, disabled khi form chưa dirty
- [ ] Toast thành công / thất bại

### 2.2. Tab "Bảo mật" (`/settings/security`)

- [ ] **Đổi mật khẩu:** mật khẩu cũ / mới / xác nhận mới + strength meter
- [ ] **2FA (Two-factor authentication):** TOTP qua Google Authenticator (QR code), backup codes
- [ ] **Lịch sử đăng nhập:** bảng IP / thiết bị (User-Agent parse) / thời gian / địa điểm (geo IP) / trạng thái thành công-thất bại
- [ ] **Phiên đang hoạt động:** danh sách các session active + nút "Đăng xuất khỏi thiết bị này" / "Đăng xuất tất cả thiết bị khác"
- [ ] **Xoá tài khoản:** danger zone, xác nhận bằng cách gõ username

### 2.3. Tab "Thông báo" (`/settings/notifications`)

- [ ] Toggle bật/tắt từng loại:
  - Cảnh báo vượt ngân sách
  - Nhắc hóa đơn định kỳ
  - Tóm tắt tài chính cuối tuần (qua email)
  - Đạt mục tiêu tiết kiệm
  - Đăng nhập từ thiết bị mới
- [ ] Kênh nhận: In-app / Email / (mở rộng: Telegram bot)

### 2.4. Tab "Tích hợp" (`/settings/integrations`)

- [ ] Liên kết tài khoản Google (đăng nhập / Google Calendar cho hóa đơn)
- [ ] Webhook URL (cho user nâng cao)
- [ ] API key cá nhân (read-only access)

### 2.5. Tab "Sao lưu & Dữ liệu" (`/settings/data`)

- [ ] Xuất toàn bộ dữ liệu (JSON / CSV)
- [ ] Nhập dữ liệu từ file
- [ ] Xoá toàn bộ giao dịch (danger zone)

---

## 3. Tính năng "Ăn điểm" — gợi ý 5 module nghiệp vụ nâng cao

| # | Tính năng | Độ khó | Giá trị đồ án |
|---|---|---|---|
| 1 | **Import/Export sao kê ngân hàng (CSV/Excel)** — parser chuẩn hoá format Vietcombank/Techcombank/MB, mapping cột, preview trước khi import, phát hiện trùng lặp | ★★★ | Rất thực tế, dễ demo |
| 2 | **Cảnh báo vượt hạn mức ngân sách thông minh** — không chỉ cảnh báo khi *đã* vượt, mà dự báo "với tốc độ chi tiêu hiện tại, bạn sẽ vượt ngân sách trong 5 ngày" (linear regression đơn giản) | ★★★ | Show được phần AI/ML |
| 3 | **Hóa đơn định kỳ (Recurring bills) + Auto-create giao dịch** — đăng ký lịch (hằng tháng/quý/năm), cron job server tự sinh transaction, có nút confirm/skip | ★★ | Trade-off backend job scheduler |
| 4 | **Mục tiêu tài chính (Goals) với gợi ý kế hoạch tiết kiệm** — nhập mục tiêu (số tiền, deadline), hệ thống đề xuất số tiền cần tiết kiệm/tháng + cảnh báo khi đi chệch | ★★ | Visualization đẹp |
| 5 | **Dự báo dòng tiền 30/60/90 ngày bằng AI** — dùng dữ liệu lịch sử + Prophet/ARIMA hoặc LLM để dự đoán số dư cuối tháng, phát hiện bất thường | ★★★★ | Điểm cộng AI/luận văn |
| 6 *(bonus)* | **Phân tích chi tiêu thông minh qua Chatbot** — "Tháng này tôi chi cho ăn uống bao nhiêu?", "So sánh với tháng trước" — đã có ChatbotPanel sẵn, mở rộng tool-calling | ★★★ | Tận dụng infra có sẵn |
| 7 *(bonus)* | **Quét hoá đơn bằng OCR** — chụp/upload bill, AI extract số tiền và danh mục, xác nhận → tạo giao dịch | ★★★★ | Wow factor |
| 8 *(bonus)* | **Multi-currency + tỷ giá real-time** — giao dịch ngoại tệ tự quy đổi VND theo tỷ giá ngày đó (gọi API exchangerate.host) | ★★ | Hữu ích cho người du lịch |

**Đề xuất chọn cho đồ án:** #1 + #2 + #4 + #5 + #6 → vừa đủ rộng (CRUD, OCR/AI, dự báo, NLP) vừa không quá tham.

---

## 4. Triển khai Code — kế hoạch theo Sprint

### Sprint 1 — Foundation (3–5 ngày)

- [ ] Refactor `Layout.tsx`: tách `Header.tsx`, `Sidebar.tsx`, `UserDropdown.tsx`, `NotificationDropdown.tsx` ra file riêng trong [components/layout/](frontend/src/components/layout/)
- [ ] Tạo `components/ui/` cho design-system primitives: `Button`, `Input`, `Modal`, `Tabs`, `Card`, `Skeleton`, `Toast`
- [ ] Cập nhật `NAV_GROUPS` với module mới
- [ ] Tạo skeleton routes trong [App.tsx](frontend/src/App.tsx) cho tất cả trang mới (placeholder content)

### Sprint 2 — Settings & Profile (3 ngày)

- [ ] Trang `/settings` với tab navigation (sub-routes nested)
- [ ] Form Profile + endpoint backend `PUT /api/users/me`
- [ ] Form đổi mật khẩu + endpoint `POST /api/users/me/password`
- [ ] Backend: bảng `login_history` + endpoint `GET /api/users/me/login-history`

### Sprint 3 — Wallets & Categories CRUD (4 ngày)

- [ ] Backend: model `Wallet`, `Category` (đã có chưa? cần kiểm tra), CRUD API
- [ ] Frontend: trang `/wallets` (grid card, modal CRUD), `/categories` (table với icon picker, color picker)
- [ ] Migrate Transaction để gắn `wallet_id`, `category_id`

### Sprint 4 — Goals & Recurring Bills (4 ngày)

- [ ] Trang `/goals` — card progress với gradient, Pareto suggestion box
- [ ] Trang `/recurring` — list bill, form tạo (cron-like preset: hằng tháng / quý / năm)
- [ ] Backend job APScheduler hoặc Celery beat sinh transaction từ recurring

### Sprint 5 — Import/Export (3 ngày)

- [ ] Trang `/import-export` với 3 bước: upload → mapping cột → preview → confirm
- [ ] Parser CSV với `papaparse`, Excel với `sheetjs` (frontend) hoặc `openpyxl` (backend)
- [ ] Detect duplicate (so sánh `date + amount + description`)

### Sprint 6 — Dashboard nâng cấp + Forecast (5 ngày)

- [ ] PeriodFilter component
- [ ] Tích hợp filter vào tất cả widget Dashboard
- [ ] Heatmap calendar (dùng `recharts` hoặc `react-calendar-heatmap`)
- [ ] Endpoint `/api/forecast/cashflow` — Prophet/ARIMA hoặc gọi LLM

### Sprint 7 — Polish & Demo (2 ngày)

- [ ] Skeleton loading, empty states cho tất cả trang
- [ ] Test E2E các luồng quan trọng
- [ ] Seed data demo (3 ví, 20 categories, 200 giao dịch 6 tháng, 3 goals, 4 recurring bills)
- [ ] Quay video demo + chuẩn bị slide

---

## 5. Cấu trúc thư mục đề xuất sau refactor

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── UserDropdown.tsx
│   │   ├── NotificationDropdown.tsx
│   │   ├── GlobalSearch.tsx
│   │   └── Breadcrumb.tsx
│   ├── ui/                    ← design system
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Tabs.tsx
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx
│   │   └── PeriodFilter.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── CashflowChart.tsx
│   │   ├── CategoryDonut.tsx
│   │   └── SpendingHeatmap.tsx
│   └── ChatbotPanel.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Wallets.tsx           ← MỚI
│   ├── Categories.tsx        ← MỚI
│   ├── Budgets.tsx
│   ├── Goals.tsx             ← MỚI
│   ├── Reports.tsx
│   ├── Forecast.tsx          ← MỚI
│   ├── Recurring.tsx         ← MỚI
│   ├── ImportExport.tsx      ← MỚI
│   ├── Chatbot.tsx
│   ├── Login.tsx
│   └── settings/
│       ├── SettingsLayout.tsx
│       ├── ProfileTab.tsx
│       ├── SecurityTab.tsx
│       ├── NotificationsTab.tsx
│       ├── IntegrationsTab.tsx
│       └── DataTab.tsx
├── context/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx      ← MỚI
├── hooks/
│   ├── useDebounce.ts
│   ├── usePeriodFilter.ts
│   └── useShortcut.ts
├── services/
│   └── api.ts
└── types/
```

---

## 6. Backend — endpoint cần thêm

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/search?q=` | Global search |
| `GET/POST/PATCH/DELETE` | `/api/wallets` | CRUD ví |
| `GET/POST/PATCH/DELETE` | `/api/categories` | CRUD danh mục |
| `GET/POST/PATCH/DELETE` | `/api/goals` | CRUD mục tiêu |
| `GET/POST/PATCH/DELETE` | `/api/recurring-bills` | CRUD hóa đơn định kỳ |
| `POST` | `/api/import/preview` | Parse file & preview |
| `POST` | `/api/import/commit` | Confirm import |
| `GET` | `/api/export?format=csv\|xlsx\|json` | Xuất dữ liệu |
| `GET` | `/api/forecast/cashflow?days=30` | Dự báo dòng tiền |
| `PUT` | `/api/users/me` | Cập nhật profile |
| `POST` | `/api/users/me/password` | Đổi mật khẩu |
| `POST` | `/api/users/me/avatar` | Upload avatar |
| `GET` | `/api/users/me/login-history` | Lịch sử đăng nhập |
| `GET/DELETE` | `/api/users/me/sessions` | Quản lý phiên |
| `GET/PATCH` | `/api/users/me/notification-prefs` | Cài đặt thông báo |

---

## 7. Acceptance criteria — báo cáo đồ án

- [ ] App có ≥ 8 trang chức năng (không tính Login)
- [ ] Có ít nhất 3 tính năng nghiệp vụ "ăn điểm" hoạt động end-to-end
- [ ] Dark/Light theme hoạt động, đa ngôn ngữ VI/EN
- [ ] Responsive: chạy mượt trên mobile (≥ 360px) → tablet → desktop
- [ ] Có test (unit ≥ 30%, e2e các luồng chính)
- [ ] README có hướng dẫn setup, có Docker compose chạy 1 lệnh
- [ ] Báo cáo có sơ đồ ERD, sequence diagram cho 2-3 use case quan trọng
- [ ] Slide demo có quay video hoặc demo trực tiếp được

---

**Cập nhật lần cuối:** 2026-05-07
