# CHƯƠNG 5: TRIỂN KHAI VÀ CÀI ĐẶT

## 5.1 Cấu trúc thư mục dự án

```
DATN/
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── api/                  # API routes
│   │   │   ├── __init__.py
│   │   │   ├── deps.py           # Dependency injection (auth)
│   │   │   ├── auth.py           # Authentication routes
│   │   │   ├── accounts.py       # Account CRUD routes
│   │   │   ├── categories.py     # Category CRUD routes
│   │   │   ├── transactions.py   # Transaction CRUD routes
│   │   │   ├── budgets.py        # Budget routes
│   │   │   ├── dashboard.py      # Dashboard statistics
│   │   │   ├── reports.py         # Report generation
│   │   │   ├── ai.py             # AI endpoints
│   │   │   └── chatbot.py         # Chatbot endpoint
│   │   ├── core/                 # Core configuration
│   │   │   ├── config.py         # Settings (BaseSettings)
│   │   │   ├── security.py       # JWT, password hashing
│   │   │   └── database.py       # SQLAlchemy engine, get_db
│   │   ├── models/               # Database models (ORM)
│   │   │   ├── __init__.py
│   │   │   └── models.py        # User, Account, Category, Transaction, Budget, AIModel, ChatHistory
│   │   ├── schemas/              # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   └── schemas.py       # Request/Response DTOs
│   │   ├── services/             # Business logic services
│   │   │   ├── __init__.py
│   │   │   └── chatbot.py       # FinanceChatbot (LangChain RAG)
│   │   ├── ai/                  # AI/ML modules
│   │   │   ├── __init__.py
│   │   │   ├── transaction_classifier.py  # TF-IDF + Naive Bayes
│   │   │   ├── cash_flow_predictor.py     # Linear Regression
│   │   │   └── anomaly_detector.py        # Isolation Forest
│   │   └── __init__.py
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile
│   └── .env
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   └── Layout.tsx       # Main layout with sidebar
│   │   ├── pages/              # Page components
│   │   │   ├── Login.tsx       # Login/Register page
│   │   │   ├── Dashboard.tsx   # Dashboard with charts
│   │   │   ├── Transactions.tsx # Transaction CRUD + AI
│   │   │   ├── Budgets.tsx      # Budget management
│   │   │   ├── Reports.tsx     # Reports + predictions
│   │   │   └── Chatbot.tsx     # Chatbot interface
│   │   ├── context/            # React context
│   │   │   └── AuthContext.tsx # Auth state management
│   │   ├── services/          # API service layer
│   │   │   └── api.ts         # ApiService class
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx            # Router setup
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles (Tailwind)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml           # Full stack orchestration
├── requirements.txt            # Backend core dependencies
├── requirements-ai.txt         # AI/ML additional dependencies
└── README.md
```

## 5.2 Triển khai Backend (FastAPI)

### 5.2.1 Database models & migrations

Database models được định nghĩa sử dụng SQLAlchemy ORM trong `app/models/models.py`. Mỗi model kế thừa từ `Base` (declarative_base), định nghĩa các columns với types, constraints, và relationships.

Tạo bảng: `Base.metadata.create_all(bind=engine)` trong `main.py` đảm bảo tất cả bảng được tạo khi ứng dụng khởi động. Các mối quan hệ:

- User → Accounts (1:N): Mỗi user có nhiều accounts
- User → Categories (1:N): Mỗi user có nhiều categories
- User → Transactions (1:N): Mỗi user có nhiều transactions
- Account → Transactions (1:N): Mỗi account có nhiều transactions
- Category → Transactions (1:N): Mỗi category có nhiều transactions
- Category → Budgets (1:N): Mỗi category có nhiều budgets
- Category tự tham chiếu (1:N): Parent-child categories

### 5.2.2 API routes implementation

Mỗi module route được tổ chức trong file riêng và đăng ký với FastAPI app qua `include_router`. Ví dụ về transaction router:

```python
@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(data: TransactionCreate, db, current_user):
    # Verify account ownership
    account = db.query(Account).filter(
        Account.id == data.account_id, Account.user_id == current_user.id
    ).first()
    # Create transaction
    # Update account balance
    # Commit and return
```

Pydantic schemas (`app/schemas/schemas.py`) định nghĩa request/response DTOs với validation: EmailStr cho email, Field constraints (min_length, gt), Optional fields với defaults.

### 5.2.3 Authentication (JWT)

JWT implementation trong `app/core/security.py`:

- **Hashing**: `passlib.context.CryptContext` với bcrypt scheme, cost factor mặc định (12)
- **Token generation**: `jose.jwt.encode` với HS256 algorithm, payload chứa `exp` (expiration) và `sub` (user_id)
- **Token verification**: `jose.jwt.decode` với SECRET_KEY và ALGORITHM
- **Dependency**: `get_current_user` dependency được inject vào mọi protected route

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    user_id = decode_token(token)
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(401)
    return user
```

### 5.2.4 AI services integration

Các AI services được implement trong `app/ai/` và được gọi từ `app/api/ai.py`. Mỗi service class nhận user_id và hoạt động độc lập cho từng user.

**TransactionClassifier**:
- Load training data từ user's labeled transactions
- Train TF-IDF + Naive Bayes pipeline
- Save/load model to disk với joblib
- Inference: transform text → predict class + probability

**CashFlowPredictor**:
- Aggregate transactions by month
- Create lag features và moving averages
- Train Linear Regression cho income và expense separately
- Predict next N months using rolling features

**AnomalyDetector**:
- Build per-category Isolation Forest models
- Detect anomalies based on amount deviation
- Generate budget alerts based on spending percentage

## 5.3 Triển khai Frontend (React)

### 5.3.1 Component architecture

Frontend sử dụng React functional components với hooks. Cấu trúc component:

```
src/
├── components/     # Shared components
│   └── Layout.tsx  # Shell với sidebar + outlet
├── pages/          # Route-level components (5 pages)
├── context/        # Global state (AuthContext)
├── services/       # API client (ApiService singleton)
└── types/         # TypeScript interfaces
```

**Layout component**: Sử dụng React Router `<Outlet>` cho nested routing. Sidebar với navigation links sử dụng `useLocation` để highlight active item.

**Page components**: Mỗi page là một functional component, sử dụng `useState` cho local state và `useEffect` cho data fetching.

### 5.3.2 State management

State management sử dụng React Context + hooks (không dùng Redux để giảm complexity):

- **AuthContext**: Quản lý user state, login/logout/register functions. Kiểm tra token trong localStorage khi mount.
- **ApiService**: Singleton class chứa tất cả API calls. Tự động attach JWT token vào mọi request. Handle 401 → redirect to login.

### 5.3.3 API integration

ApiService (`src/services/api.ts`) cung cấp typed methods cho mỗi endpoint:

```typescript
async getDashboardStats(): Promise<DashboardStats> {
  return this.request('/dashboard/stats');
}

async createTransaction(data): Promise<Transaction> {
  return this.request('/transactions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### 5.3.4 Dashboard & Charts

Dashboard sử dụng Recharts cho visualization:

- **PieChart**: Biểu đồ tròn chi tiêu theo danh mục (Recharts Pie)
- **Stat cards**: 4 cards hiển thị metrics chính với icons
- **Transaction list**: Inline list với color-coded amounts
- **Budget alerts**: Conditional rendering khi có alerts

## 5.4 Triển khai AI modules

### 5.4.1 Transaction classification model

Implementation chi tiết trong `app/ai/transaction_classifier.py`:

```python
class TransactionClassifier:
    def train(self, texts, labels):
        self.vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
        X = self.vectorizer.fit_transform(texts)
        self.model = MultinomialNB(alpha=0.1)
        self.model.fit(X_train, y_train)
        # Save with joblib
        joblib.dump(self.model, self.model_path)

    def predict(self, description):
        X = self.vectorizer.transform([description])
        pred = self.model.predict(X)[0]
        prob = self.model.predict_proba(X)[0].max()
        return pred, prob
```

### 5.4.2 Cash flow prediction model

Implementation trong `app/ai/cash_flow_predictor.py`:

```python
class CashFlowPredictor:
    def train(self, transactions):
        df = pd.DataFrame(transactions)
        df["month"] = pd.to_datetime(df["date"]).dt.to_period("M")
        monthly = df.groupby(["month", "type"])["amount"].sum().unstack(fill_value=0)
        # Create lag features: income_lag1, income_lag2, expense_lag1...
        # Train Linear Regression
        self.model_income.fit(X_scaled, y_income)
        self.model_expense.fit(X_scaled, y_expense)
```

### 5.4.3 Anomaly detection model

Implementation trong `app/ai/anomaly_detector.py`:

```python
class AnomalyDetector:
    def train(self, transactions):
        for category_id, group in transactions.groupby("category_id"):
            features = [[amount, day, dow, month] for each tx]
            X = self.scaler.fit_transform(features)
            model = IsolationForest(contamination=0.1)
            model.fit(X)
            self.trained_categories[category_id] = model
```

### 5.4.4 Chatbot implementation

Implementation trong `app/services/chatbot.py`:

```python
class FinanceChatbot:
    def _setup(self):
        # Initialize Ollama LLM
        self.llm = Ollama(model="llama3", base_url=settings.OLLAMA_BASE_URL)
        # Split knowledge base text
        texts = RecursiveCharacterTextSplitter(chunk_size=500).split_text(KNOWLEDGE)
        # Create vector store
        vectorstore = Chroma.from_texts(texts, embeddings=OllamaEmbeddings(...))
        # Create retrieval chain
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        self.qa_chain = create_retrieval_chain(retriever, document_chain)
```

Knowledge base chứa nội dung về: quy tắc 50/30/20, mẹo tiết kiệm, quỹ khẩn cấp, chiến lược trả nợ, đầu tư cơ bản. Fallback keyword-based responses khi LLM không khả dụng.

## 5.5 Deployment (Docker)

### 5.5.1 Docker Compose Configuration

File `docker-compose.yml` định nghĩa 4 services:

- **postgres**: PostgreSQL 16 Alpine, persistent volume, healthcheck
- **redis**: Redis 7 Alpine, persistent volume, healthcheck
- **backend**: Python 3.11, FastAPI, port 8000, depends on postgres + redis
- **frontend**: Node 20 + Nginx, port 3000, built from React app

### 5.5.2 Backend Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.5.3 Frontend Dockerfile

Multi-stage build: Node 20 build React app → Nginx serve static files. Nginx config proxy `/api` requests to backend.

### 5.5.4 Quick Start

```bash
# Clone project
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# New terminal
cd frontend
npm install
npm run dev
```

Hoặc với Docker:
```bash
docker-compose up -d
```

## 5.6 Một số điểm triển khai đáng chú ý

**AI Classification Pipeline**: Khi user nhấn nút Sparkles bên cạnh category selector trong form thêm giao dịch, frontend gọi API `/ai/categorize` với mô tả giao dịch. Backend sử dụng trained model (hoặc fallback) để trả về category suggestion. User có thể chấp nhận hoặc chọn category khác.

**Account Balance Auto-update**: Khi tạo transaction, không chỉ lưu transaction record mà còn cập nhật account.balance tương ứng trong cùng transaction (đảm bảo atomicity với SQLAlchemy session).

**Budget Period Calculation**: Budget progress được tính toán động dựa trên period (weekly/monthly/yearly) và reference date (hiện tại). Sử dụng `calendar.monthrange` và `timedelta` để xác định period boundaries.

**RAG Fallback**: Nếu Ollama service không chạy (do hardware requirements), chatbot fallback sang keyword-based responses. Điều này đảm bảo chatbot vẫn hoạt động ở mức cơ bản mà không cần GPU.
