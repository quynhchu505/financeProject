import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class BudgetPeriod(str, enum.Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Profile fields
    phone = Column(String(32), nullable=True)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    gender = Column(String(16), nullable=True)
    address = Column(String(500), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # Preferences
    currency = Column(String(10), nullable=False, default="VND")
    timezone = Column(String(64), nullable=False, default="Asia/Ho_Chi_Minh")
    language = Column(String(10), nullable=False, default="vi")
    date_format = Column(String(20), nullable=False, default="dd/MM/yyyy")
    week_start = Column(String(10), nullable=False, default="monday")
    notification_prefs = Column(Text, nullable=True)

    # Security
    two_fa_enabled = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    ai_models = relationship("AIModel", back_populates="user", cascade="all, delete-orphan")
    ml_logs = relationship("MLLog", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    login_history = relationship("LoginHistory", back_populates="user", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_accounts_user_id_name"),
        Index("ix_accounts_user_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    account_type = Column(String(50), nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="VND", nullable=False)
    icon = Column(String(50), default="wallet", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_categories_user_id_name"),
        Index("ix_categories_user_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    icon = Column(String(50), default="tag", nullable=False)
    color = Column(String(20), default="#6366f1", nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    is_system = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="categories")
    parent = relationship("Category", remote_side=[id], backref="subcategories")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        Index("ix_transactions_user_id", "user_id"),
        Index("ix_transactions_account_id", "account_id"),
        Index("ix_transactions_category_id", "category_id"),
        Index("ix_transactions_date", "date"),
        Index("ix_transactions_deleted_at", "deleted_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(DateTime(timezone=True), nullable=False)
    is_ai_categorized = Column(Boolean, default=False, nullable=False)
    ai_confidence = Column(Float, nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    ml_logs = relationship("MLLog", back_populates="transaction", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="transaction")


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("user_id", "category_id", "period", name="uq_budgets_user_category_period"),
        Index("ix_budgets_user_id", "user_id"),
        Index("ix_budgets_category_id", "category_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    period = Column(String(20), default=BudgetPeriod.MONTHLY.value, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")


class AIModel(Base):
    __tablename__ = "ai_models"
    __table_args__ = (Index("ix_ai_models_user_id", "user_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_type = Column(String(100), nullable=False)
    accuracy_score = Column(Float, nullable=True)
    trained_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    model_path = Column(String(500), nullable=True)

    user = relationship("User", back_populates="ai_models")


class MLLog(Base):
    __tablename__ = "ml_logs"
    __table_args__ = (
        Index("ix_ml_logs_user_id", "user_id"),
        Index("ix_ml_logs_transaction_id", "transaction_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    model_type = Column(String(50), nullable=False, default="classifier")
    input_text = Column(Text, nullable=False)
    predicted_category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    actual_category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    confidence_score = Column(Float, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="ml_logs")
    transaction = relationship("Transaction", back_populates="ml_logs")


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        Index("ix_alerts_user_id", "user_id"),
        Index("ix_alerts_transaction_id", "transaction_id"),
        Index("ix_alerts_is_read", "is_read"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    budget_id = Column(Integer, ForeignKey("budgets.id", ondelete="SET NULL"), nullable=True)
    alert_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False, default="medium")
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    anomaly_score = Column(Float, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="alerts")
    transaction = relationship("Transaction", back_populates="alerts")
    budget = relationship("Budget")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    __table_args__ = (
        UniqueConstraint("token_hash", name="uq_refresh_tokens_token_hash"),
        Index("ix_refresh_tokens_user_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(64), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="refresh_tokens")


class LoginHistory(Base):
    __tablename__ = "login_history"
    __table_args__ = (
        Index("ix_login_history_user_id", "user_id"),
        Index("ix_login_history_created_at", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="success")
    failure_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="login_history")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (Index("ix_chat_sessions_user_id", "user_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Phiên mới", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatHistory", back_populates="session", cascade="all, delete-orphan")


class ChatHistory(Base):
    __tablename__ = "chat_history"
    __table_args__ = (
        Index("ix_chat_history_user_id", "user_id"),
        Index("ix_chat_history_session_id", "session_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="chat_history")
    session = relationship("ChatSession", back_populates="messages")
