from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import desc, func

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.models import Alert, Budget, Category, Transaction, TransactionType

LANGCHAIN_GROQ_AVAILABLE = False
LANGCHAIN_OLLAMA_AVAILABLE = False

try:
    from langchain_groq import ChatGroq

    LANGCHAIN_GROQ_AVAILABLE = True
except ImportError:
    ChatGroq = None

try:
    from langchain_community.llms import Ollama

    LANGCHAIN_OLLAMA_AVAILABLE = True
except ImportError:
    Ollama = None


FINANCE_KNOWLEDGE = """
Nguyen tac 50/30/20:
- 50% cho nhu cau thiet yeu
- 30% cho mong muon
- 20% cho tiet kiem va tra no

Goi y:
- Lap ngan sach hang thang
- Tao quy khan cap 3-6 thang chi phi sinh hoat
- Theo doi giao dich thu/chi thuong xuyen
- Giam chi phi co the cat bo
- Tra no lai suat cao truoc
"""


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class FinanceChatbot:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.provider = settings.LLM_PROVIDER
        self.llm = self._setup_llm()

    def _setup_llm(self):
        if self.provider == "groq" and LANGCHAIN_GROQ_AVAILABLE and settings.GROQ_API_KEY:
            return ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model="llama-3.1-8b-instant",
                temperature=0.4,
            )
        if self.provider == "ollama" and LANGCHAIN_OLLAMA_AVAILABLE:
            return Ollama(
                model="llama3",
                base_url=settings.OLLAMA_BASE_URL,
                temperature=0.4,
            )
        if settings.GROQ_API_KEY and LANGCHAIN_GROQ_AVAILABLE:
            return ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model="llama-3.1-8b-instant",
                temperature=0.4,
            )
        if LANGCHAIN_OLLAMA_AVAILABLE:
            return Ollama(
                model="llama3",
                base_url=settings.OLLAMA_BASE_URL,
                temperature=0.4,
            )
        return None

    def _can_send_personal_context(self) -> bool:
        if self.provider == "ollama":
            return True
        return settings.ALLOW_EXTERNAL_FINANCE_CONTEXT

    def _build_user_context(self) -> str:
        if not self._can_send_personal_context():
            return (
                "Khong gui du lieu tai chinh ca nhan vi provider hien tai duoc coi la external. "
                "Chi duoc tra loi dua tren kien thuc tai chinh chung."
            )

        db = SessionLocal()
        try:
            now = utcnow()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            income = (
                db.query(func.coalesce(func.sum(Transaction.amount), 0))
                .filter(
                    Transaction.user_id == self.user_id,
                    Transaction.deleted_at.is_(None),
                    Transaction.transaction_type == TransactionType.INCOME.value,
                    Transaction.date >= month_start,
                )
                .scalar()
            )
            expense = (
                db.query(func.coalesce(func.sum(Transaction.amount), 0))
                .filter(
                    Transaction.user_id == self.user_id,
                    Transaction.deleted_at.is_(None),
                    Transaction.transaction_type == TransactionType.EXPENSE.value,
                    Transaction.date >= month_start,
                )
                .scalar()
            )

            top_categories = (
                db.query(Category.name, func.sum(Transaction.amount).label("total"))
                .join(Transaction, Transaction.category_id == Category.id)
                .filter(
                    Transaction.user_id == self.user_id,
                    Transaction.deleted_at.is_(None),
                    Transaction.transaction_type == TransactionType.EXPENSE.value,
                    Transaction.date >= month_start,
                )
                .group_by(Category.id, Category.name)
                .order_by(desc("total"))
                .limit(3)
                .all()
            )

            active_budget_count = db.query(Budget).filter(Budget.user_id == self.user_id).count()
            open_alert_count = db.query(Alert).filter(Alert.user_id == self.user_id, Alert.is_resolved.is_(False)).count()

            top_lines = "\n".join([f"- {name}: {float(total):,.0f} VND" for name, total in top_categories]) or "- Chua co"

            return (
                f"Tom tat tai chinh thang nay:\n"
                f"- Tong thu: {float(income):,.0f} VND\n"
                f"- Tong chi: {float(expense):,.0f} VND\n"
                f"- So ngan sach dang theo doi: {active_budget_count}\n"
                f"- So canh bao dang mo: {open_alert_count}\n"
                f"- Top danh muc chi tieu:\n{top_lines}"
            )
        finally:
            db.close()

    def _build_prompt(self, message: str) -> str:
        context = self._build_user_context()
        return (
            "Ban la tro ly tai chinh ca nhan, tra loi bang tieng Viet, ngan gon, thuc te, "
            "khong dua ra loi khuyen dau tu mang tinh cam ket.\n\n"
            f"Kien thuc nen:\n{FINANCE_KNOWLEDGE}\n\n"
            f"Ngu canh nguoi dung:\n{context}\n\n"
            f"Cau hoi:\n{message}\n\n"
            "Tra loi:"
        )

    def chat(self, message: str) -> dict:
        prompt = self._build_prompt(message)
        if self.llm is None:
            return {"response": self._fallback_response(message), "sources": []}

        try:
            result = self.llm.invoke(prompt)
            if hasattr(result, "content"):
                return {"response": result.content, "sources": []}
            if isinstance(result, str):
                return {"response": result, "sources": []}
            return {"response": str(result), "sources": []}
        except Exception:
            return {"response": self._fallback_response(message), "sources": []}

    def _fallback_response(self, message: str) -> str:
        msg_lower = message.lower()
        if any(kw in msg_lower for kw in ["tiết kiệm", "tiet kiem", "save"]):
            return (
                "De tiet kiem hieu qua, ban nen ap dung quy tac 50/30/20, "
                "chuyen tien tiet kiem ngay khi nhan thu nhap va theo doi nhung khoan chi lap lai."
            )
        if any(kw in msg_lower for kw in ["đầu tư", "dau tu", "invest"]):
            return (
                "Neu moi bat dau, hay uu tien quy khan cap, tranh no xau, "
                "sau do moi xem cac kenh dau tu da dang va phu hop muc rui ro cua ban."
            )
        if any(kw in msg_lower for kw in ["ngân sách", "ngan sach", "budget", "chi tiêu", "chi tieu"]):
            return (
                "Ban nen dat han muc theo danh muc, theo doi chi phi hang ngay va danh gia lai moi cuoi thang "
                "de cat bo cac khoan vuot nhu cau."
            )
        return (
            "Toi co the ho tro ve ngan sach, tiet kiem, quy khan cap, quan ly no va muc tieu tai chinh. "
            "Ban hay noi ro hon muc ban muon hoi."
        )
