# CHƯƠNG 4: THIẾT KẾ HỆ THỐNG

## 4.1 Thiết kế kiến trúc

### 4.1.1 Sơ đồ kiến trúc tổng quát

Hệ thống được thiết kế theo mô hình Client-Server với kiến trúc phân lớp (layered architecture), kết hợp microservices-lite cho các module AI độc lập. Kiến trúc tổng quát bao gồm:

**Lớp Presentation (Frontend)**: React SPA chạy trên trình duyệt, giao tiếp với backend qua REST API. Người dùng tương tác với hệ thống thông qua giao diện web responsive, được thiết kế theo nguyên tắc mobile-first.

**Lớp Business Logic (Backend API)**: FastAPI xử lý logic nghiệp vụ, authentication, và điều phối giữa các services. Backend được chia thành các module nhỏ hơn: API routes, Services, và AI modules.

**Lớp Data Access**: SQLAlchemy ORM làm abstraction layer giữa Python code và PostgreSQL database. Redis được sử dụng cho caching và session management.

**Lớp AI/ML**: Các mô hình AI được đóng gói thành các service classes riêng biệt, có thể được gọi từ API routes. Chatbot sử dụng LangChain framework với vector database.

```
┌──────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                         │
│            React + TypeScript + Tailwind CSS + Recharts           │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ HTTPS
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Load Balancer (optional)                     │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ HTTP / WebSocket
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Backend Layer (FastAPI)                       │
│  ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ Auth Router  │ Account/Cat/ │ Budget/Dash/ │ AI Router      │ │
│  │ (JWT)       │ TX Router    │ Report Router│ + Chatbot Router│ │
│  └──────┬──────┴──────┬──────┴──────┬──────┴───────┬──────────┘ │
│         │             │             │               │            │
│  ┌──────▼─────────────▼─────────────▼──────────────▼──────────┐ │
│  │                   Service Layer                              │ │
│  │  TransactionService │ BudgetService │ ReportService │ Chatbot │ │
│  └──────┬─────────────┬──────────────┬──────────────┬──────────┘ │
│         │             │              │              │             │
│  ┌──────▼─────────────▼──────────────▼──────────────▼──────────┐ │
│  │              AI/ML Models Layer                              │ │
│  │  TransactionClassifier │ CashFlowPredictor │ AnomalyDetector │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬───────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   PostgreSQL     │    │     Redis        │    │   Vector DB      │
│   (Relational)   │    │   (Cache)        │    │   (Chroma)       │
│   users, txs...  │    │   Sessions       │    │   Knowledge base │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### 4.1.2 Sơ đồ kiến trúc chi tiết từng module

**Module Authentication**: Sử dụng JWT (JSON Web Token) với bcrypt password hashing. Flow: User gửi email/password → Server verify → Tạo JWT với user_id → Gửi token về client → Client lưu trong localStorage → Client gửi token trong Authorization header cho mọi request → Server decode và verify token.

**Module Transaction Management**: Xử lý CRUD operations cho transactions. Mỗi transaction khi được tạo sẽ tự động cập nhật balance của account tương ứng. AI classifier được gọi khi user nhập mô tả giao dịch để đề xuất danh mục.

**Module AI Services**: Các model được train và inference trong Python process. Models được persist vào disk (joblib pickle files). Mỗi user có model instance riêng, được load on-demand.

## 4.2 Thiết kế cơ sở dữ liệu

### 4.2.1 Sơ đồ ERD

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │    ACCOUNTS      │       │  TRANSACTIONS   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK id           │──┐    │ PK id           │──┐    │ PK id            │
│     email       │  │    │ FK user_id      │◄─┘    │ FK user_id      │◄─┐
│     password_hash│ │    │     name        │       │ FK account_id   │──┘
│     name        │  │    │     account_type│       │ FK category_id  │◄─┐
│     created_at  │  │    │     balance     │       │     amount      │  │
│     updated_at  │──┼────│     currency    │       │     type        │  │
└─────────────────┘  │    │     icon        │       │     description │  │
                     │    │     created_at  │       │     date        │  │
                     │    └─────────────────┘       │ is_ai_categorized│  │
                     │                              │     created_at  │  │
                     │                              └─────────────────┘  │
                     │                                     ▲             │
                     │                                     │             │
                     │       ┌─────────────────┐            │             │
                     │       │   CATEGORIES    │────────────┘             │
                     │       ├─────────────────┤                          │
                     │       │ PK id           │◄──────────────┐          │
                     └───FK──│ FK user_id     │───────────────┘          │
                     │       │     name        │                          │
                     │       │     icon        │                          │
                     │       │     color       │                          │
                     │       │ FK parent_id   │──┐                       │
                     │       │     is_system   │  │ self-reference       │
                     │       └─────────────────┘  │                       │
                     │                           │                       │
                     │       ┌─────────────────┐  │                       │
                     │       │    BUDGETS      │──┘                       │
                     │       ├─────────────────┤                          │
                     └───FK──│ PK id           │◄─────────────────────────┘
                             │ FK user_id     │
                             │ FK category_id │◄─────────────────────────────┘
                             │     amount     │
                             │     period     │
                             │   created_at   │
                             └─────────────────┘
```

### 4.2.2 Mô tả các bảng

**Bảng users**: Lưu thông tin người dùng. Email là unique identifier. Password được hash bằng bcrypt. Thời gian tạo và cập nhật được tự động ghi nhận.

**Bảng accounts**: Lưu các tài khoản tài chính của user. Balance được tự động cập nhật khi có giao dịch. Hỗ trợ nhiều loại tài khoản: checking, savings, credit, cash.

**Bảng categories**: Lưu danh mục chi tiêu. Có cấu trúc cây (parent_id) để hỗ trợ sub-categories. Flag is_system đánh dấu categories được tạo mặc định.

**Bảng transactions**: Lưu giao dịch. Transaction type là enum (income/expense). is_ai_categorized đánh dấu giao dịch được phân loại tự động. Amount luôn dương, type quyết định ý nghĩa.

**Bảng budgets**: Lưu ngân sách theo danh mục. Period có thể là weekly, monthly, yearly.

**Bảng ai_models**: Lưu metadata về các mô hình AI đã train cho user (type, accuracy, thời gian train).

**Bảng chat_history**: Lưu lịch sử trò chuyện chatbot của user.

## 4.3 Thiết kế API

### 4.3.1 REST API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /api/v1/auth/register | Đăng ký tài khoản mới |
| POST | /api/v1/auth/login | Đăng nhập, nhận JWT token |
| GET | /api/v1/auth/me | Lấy thông tin user hiện tại |
| GET | /api/v1/accounts/ | Danh sách tài khoản |
| POST | /api/v1/accounts/ | Tạo tài khoản mới |
| GET | /api/v1/accounts/{id} | Chi tiết tài khoản |
| PUT | /api/v1/accounts/{id} | Cập nhật tài khoản |
| DELETE | /api/v1/accounts/{id} | Xóa tài khoản |
| GET | /api/v1/categories/ | Danh sách danh mục |
| POST | /api/v1/categories/ | Tạo danh mục mới |
| POST | /api/v1/categories/init-default | Tạo danh mục mặc định |
| GET | /api/v1/transactions/ | Danh sách giao dịch (filterable) |
| POST | /api/v1/transactions/ | Tạo giao dịch mới |
| PUT | /api/v1/transactions/{id} | Cập nhật giao dịch |
| DELETE | /api/v1/transactions/{id} | Xóa giao dịch |
| GET | /api/v1/budgets/ | Danh sách ngân sách với tiến độ |
| POST | /api/v1/budgets/ | Tạo ngân sách mới |
| PUT | /api/v1/budgets/{id} | Cập nhật ngân sách |
| DELETE | /api/v1/budgets/{id} | Xóa ngân sách |
| GET | /api/v1/dashboard/stats | Dashboard statistics |
| GET | /api/v1/reports/monthly | Báo cáo tháng (filterable) |
| POST | /api/v1/ai/categorize | AI phân loại giao dịch |
| POST | /api/v1/ai/train-classifier | Train classifier |
| GET | /api/v1/ai/predict-cashflow | AI dự đoán dòng tiền |
| GET | /api/v1/ai/anomaly-alerts | AI cảnh báo bất thường |
| POST | /api/v1/chatbot/chat | Chat với chatbot |

### 4.3.2 Authentication Flow

```
1. User Registration:
   Client ──POST /auth/register──> Server
   Input: {email, password, name}
   Server: Hash password, Create user, Return user info
   Client: Redirect to login

2. User Login:
   Client ──POST /auth/login──> Server
   Input: {email, password}
   Server: Verify credentials, Generate JWT (HS256, 7 days)
   Response: {access_token, token_type: "bearer"}
   Client: Store token in localStorage

3. Authenticated Request:
   Client ──GET /accounts──> Server
   Header: Authorization: Bearer <token>
   Server: Decode JWT, Verify, Extract user_id
   If valid: Process request, Return data
   If invalid: Return 401 Unauthorized
```

## 4.4 Thiết kế giao diện

### 4.4.1 Layout chính

Giao diện được thiết kế theo phong cách SaaS hiện đại, sử dụng sidebar navigation cố định. Cấu trúc layout bao gồm: Top navigation bar chứa logo, user profile, logout; Sidebar navigation với 5 mục chính: Dashboard, Giao dịch, Ngân sách, Báo cáo, Tư vấn; Main content area với padding và max-width phù hợp.

### 4.4.2 Các trang chính

**Dashboard**: Hiển thị 4 stat cards (tổng số dư, thu nhập tháng, chi tiêu tháng, tỷ lệ tiết kiệm), biểu đồ tròn chi tiêu theo danh mục, danh sách giao dịch gần đây, cảnh báo ngân sách.

**Giao dịch**: Bảng danh sách giao dịch với filter/search, nút thêm giao dịch mới (mở modal), tích hợp nút AI để phân loại tự động.

**Ngân sách**: Grid layout hiển thị các budget cards, mỗi card có progress bar, thông tin đã chi/còn lại, nút thêm/chỉnh sửa.

**Báo cáo**: Biểu đồ cột thu chi theo tháng, biểu đồ đường dự đoán dòng tiền, chi tiết breakdown theo danh mục.

**Chatbot**: Giao diện chat với message bubbles, quick questions, typing indicator.

### 4.4.3 Responsive Strategy

- Desktop (>1024px): Full sidebar + content layout
- Tablet (768-1024px): Collapsible sidebar
- Mobile (<768px): Bottom navigation bar, stacked layouts

## 4.5 Thiết kế thuật toán AI

### 4.5.1 Mô hình phân loại giao dịch

**Input**: Mô tả văn bản của giao dịch (string), số tiền (float, tùy chọn)
**Output**: Category ID và confidence score

**Thuật toán**: TF-IDF Vectorization + Multinomial Naive Bayes

```
1. Text Preprocessing:
   - Lowercase
   - Remove special characters
   - Tokenize (word-level)

2. Feature Extraction (TF-IDF):
   - max_features: 1000
   - ngram_range: (1, 2)  # unigrams + bigrams
   - min_df: 1

3. Model Training (Naive Bayes):
   - alpha (smoothing): 0.1
   - Training split: 80/20

4. Inference:
   - Transform input text
   - Predict class
   - Get probability distribution
   - Return class with highest probability
```

**Đặc điểm**: Naive Bayes phù hợp với text classification vì xử lý tốt high-dimensional sparse features (TF-IDF vectors). Fast training và inference. Robust với small training sets khi có smoothing.

### 4.5.2 Mô hình dự đoán dòng tiền

**Input**: Lịch sử giao dịch (list of {date, amount, type})
**Output**: Dự đoán thu/chi cho N tháng tiếp theo

**Thuật toán**: Linear Regression với lag features

```
1. Data Preparation:
   - Aggregate transactions by month
   - Create time series: income[month], expense[month]
   - Handle missing months (fill with 0)

2. Feature Engineering:
   - Lag features: income_lag1, income_lag2, income_lag3
   - Moving average: income_ma3, expense_ma3
   - Scale: MinMaxScaler

3. Model:
   - Separate models for income and expense
   - Linear Regression (simple, interpretable)
   - Train/test split based on time order

4. Inference:
   - Use last N months to predict next month
   - Rolling prediction for N months ahead
   - Confidence based on ratio of prediction to historical average
```

### 4.5.3 Mô hình phát hiện bất thường

**Input**: Transactions grouped by category
**Output**: List of anomalies with severity

**Thuật toán**: Isolation Forest

```
1. Per-Category Model:
   - Group transactions by category_id
   - Extract features: amount, day_of_month, day_of_week, month

2. Isolation Forest Training:
   - n_estimators: 100 (default)
   - contamination: 0.1 (10% outliers expected)
   - max_samples: auto
   - random_state: 42

3. Detection:
   - For each new transaction:
     * Build feature vector
     * Predict: -1 (anomaly) or 1 (normal)
     * Get anomaly score (more negative = more anomalous)
   - Severity mapping:
     * score < -0.9 → HIGH
     * score < -0.7 → MEDIUM
     * else → LOW

4. Budget Alert Generation:
   - Compare spending vs budget per category
   - 80-99% → medium alert
   - >= 100% → high alert
```

### 4.5.4 Kiến trúc Chatbot RAG

```
                    User Query
                        │
                        ▼
              ┌─────────────────┐
              │  Query Embedding │ (Ollama embeddings)
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Vector Search   │ (Chroma similarity search, k=3)
              │  in Knowledge DB │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Context Docs   │ (Top-3 relevant chunks)
              └────────┬────────┘
                       │
                       ▼
              ┌──────────────────────────────────────────┐
              │          LLM (Ollama llama3)             │
              │  Prompt: [System] + [Context] + [Query]   │
              └────────┬─────────────────────────────────┘
                       │
                       ▼
                   Response
```

**Knowledge Base Content**: Tiêu chuẩn 50/30/20, mẹo tiết kiệm, quỹ khẩn cấp, chiến lược trả nợ, đầu tư cơ bản, cách theo dõi chi tiêu, cách lập mục tiêu tài chính.

**Fallback System**: Khi LangChain/LLM không khả dụng, chatbot sử dụng keyword matching để trả lời các câu hỏi phổ biến về: tiết kiệm, đầu tư, ngân sách, nợ, quỹ khẩn cấp.
