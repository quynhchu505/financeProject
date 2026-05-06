from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.models import BudgetPeriod, TransactionType


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AccountCreate(BaseModel):
    name: str = Field(min_length=1)
    account_type: str
    currency: str = "VND"
    icon: str = "wallet"


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[str] = None
    currency: Optional[str] = None
    icon: Optional[str] = None


class AccountResponse(BaseModel):
    id: int
    user_id: int
    name: str
    account_type: str
    balance: float
    currency: str
    icon: str
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1)
    icon: str = "tag"
    color: str = "#6366f1"
    parent_id: Optional[int] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    icon: str
    color: str
    parent_id: Optional[int]
    is_system: bool

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    amount: float = Field(gt=0)
    transaction_type: TransactionType
    description: Optional[str] = None
    date: datetime
    is_ai_categorized: bool = False
    ai_confidence: Optional[float] = Field(default=None, ge=0, le=1)


class TransactionUpdate(BaseModel):
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    amount: Optional[float] = Field(default=None, gt=0)
    transaction_type: Optional[TransactionType] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    account_id: int
    category_id: Optional[int]
    amount: float
    transaction_type: TransactionType
    description: Optional[str]
    date: datetime
    is_ai_categorized: bool
    ai_confidence: Optional[float]
    created_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class BudgetCreate(BaseModel):
    category_id: int
    amount: float = Field(gt=0)
    period: BudgetPeriod = BudgetPeriod.MONTHLY


class BudgetUpdate(BaseModel):
    amount: Optional[float] = Field(default=None, gt=0)
    period: Optional[BudgetPeriod] = None


class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category_id: int
    amount: float
    period: BudgetPeriod
    category: CategoryResponse

    class Config:
        from_attributes = True


class BudgetProgress(BaseModel):
    budget: BudgetResponse
    spent: float
    remaining: float
    percentage: float


class TransferCreate(BaseModel):
    from_account_id: int
    to_account_id: int
    amount: float = Field(gt=0)
    description: Optional[str] = None
    date: datetime


class TransferResponse(BaseModel):
    from_transaction: TransactionResponse
    to_transaction: TransactionResponse


class DashboardStats(BaseModel):
    total_balance: float
    monthly_income: float
    monthly_expense: float
    savings_rate: float
    top_categories: List[dict]
    recent_transactions: List[TransactionResponse]
    budget_alerts: List[BudgetProgress]
    anomaly_alerts: List["AlertResponse"] = []


class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    category_color: str
    total_amount: float
    transaction_count: int
    percentage: float


class MonthlyReport(BaseModel):
    month: str
    income: float
    expense: float
    net: float
    categories: List[CategorySummary]


class ExportResponse(BaseModel):
    filename: str
    content_type: str


class AICategorizationRequest(BaseModel):
    description: str = Field(min_length=1)
    amount: Optional[float] = None


class AICategorizationResponse(BaseModel):
    category_id: int
    category_name: str
    confidence: float
    should_autofill: bool = False


class ClassifierFeedbackRequest(BaseModel):
    description: str
    predicted_category_id: Optional[int] = None
    actual_category_id: int
    transaction_id: Optional[int] = None


class AnomalyFeedbackRequest(BaseModel):
    alert_id: int
    verdict: str = Field(pattern="^(normal|investigate)$")


class CashFlowPrediction(BaseModel):
    month: str
    predicted_income: float
    predicted_expense: float
    confidence: float
    lower_bound_income: Optional[float] = None
    upper_bound_income: Optional[float] = None
    lower_bound_expense: Optional[float] = None
    upper_bound_expense: Optional[float] = None


class AnomalyAlert(BaseModel):
    transaction_id: Optional[int] = None
    category_name: str
    expected_amount: float
    actual_amount: float
    deviation: float
    severity: str
    score: Optional[float] = None


class AlertResponse(BaseModel):
    id: int
    user_id: int
    transaction_id: Optional[int]
    budget_id: Optional[int]
    alert_type: str
    severity: str
    title: str
    message: str
    anomaly_score: Optional[float]
    is_read: bool
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    message: str = Field(min_length=1)
    session_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None
    session_id: Optional[int] = None


class ChatSessionCreate(BaseModel):
    title: Optional[str] = None


class ChatSessionUpdate(BaseModel):
    title: str = Field(min_length=1)


class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class ChatMessageItem(BaseModel):
    id: int
    user_id: int
    session_id: Optional[int]
    message: str
    response: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionDetail(ChatSessionResponse):
    messages: List[ChatMessageItem] = []


class PaginatedTransactionsResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    pages: int


class HealthComponent(BaseModel):
    status: str
    detail: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    components: dict[str, HealthComponent]


class ErrorResponse(BaseModel):
    status_code: int
    error: str
    detail: str
    path: Optional[str] = None
    correlation_id: Optional[str] = None
    errors: Optional[list[dict]] = None


DashboardStats.model_rebuild()
