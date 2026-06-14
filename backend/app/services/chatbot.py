from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import desc, func

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.models import Alert, Budget, Category, Transaction, TransactionType

try:
    from groq import Groq

    GROQ_AVAILABLE = True
except ImportError:  # pragma: no cover - exercised when dependency is absent
    Groq = None
    GROQ_AVAILABLE = False


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
    """Finance chatbot wrapper that talks to Groq directly."""

    def __init__(self, user_id: int):
        self.user_id = user_id
        self.logger = logging.getLogger(__name__)
        self.client = self._setup_client()

    def _setup_client(self):
        if not GROQ_AVAILABLE:
            self.logger.warning(
                "Groq SDK is not installed; chatbot will use fallback responses",
                extra={"extra_data": {"user_id": self.user_id}},
            )
            return None
        if not settings.GROQ_API_KEY:
            self.logger.warning(
                "GROQ_API_KEY is missing; chatbot will use fallback responses",
                extra={"extra_data": {"user_id": self.user_id}},
            )
            return None
        try:
            return Groq(api_key=settings.GROQ_API_KEY)
        except Exception as exc:
            self.logger.exception(
                "Failed to initialize Groq client",
                exc_info=exc,
                extra={"extra_data": {"user_id": self.user_id, "provider": "groq"}},
            )
            return None

    def _can_send_personal_context(self) -> bool:
        return bool(settings.ALLOW_EXTERNAL_FINANCE_CONTEXT)

    def _build_user_context(self) -> str:
        if not self._can_send_personal_context():
            return (
                "Không gửi dữ liệu tài chính cá nhân vì provider hiện tại được coi là external. "
                "Chỉ trả lời dựa trên kiến thức tài chính chung."
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
                f"Tóm tắt tài chính tháng này:\n"
                f"- Tổng thu: {float(income):,.0f} VND\n"
                f"- Tổng chi: {float(expense):,.0f} VND\n"
                f"- Số ngân sách đang theo dõi: {active_budget_count}\n"
                f"- Số cảnh báo đang mở: {open_alert_count}\n"
                f"- Top danh mục chi tiêu:\n{top_lines}"
            )
        finally:
            db.close()

    def _build_messages(self, message: str) -> list[dict[str, str]]:
        context = self._build_user_context()
        system_prompt = (
            "Ban la tro ly tai chinh ca nhan. Tra loi bang tieng Viet, ngan gon, thuc te, "
            "va khong dua ra loi khuyen dau tu mang tinh cam ket.\n\n"
            f"Kien thuc nen:\n{FINANCE_KNOWLEDGE}\n\n"
            f"Ngu canh nguoi dung:\n{context}"
        )
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ]

    def chat(self, message: str) -> dict:
        try:
            messages = self._build_messages(message)
        except Exception as exc:
            self.logger.exception("Failed building prompt", exc_info=exc, extra={"extra_data": {"user_id": self.user_id}})
            return {"response": self._fallback_response(message), "sources": []}

        if self.client is None:
            self.logger.warning(
                "LLM client not configured; returning fallback response",
                extra={"extra_data": {"user_id": self.user_id, "provider": "groq"}},
            )
            return {"response": self._fallback_response(message), "sources": []}

        try:
            result = self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                temperature=0.4,
            )
        except Exception as exc:
            preview = message[:500] + "..." if len(message) > 500 else message
            self.logger.exception(
                "LLM invocation failed",
                exc_info=exc,
                extra={"extra_data": {"user_id": self.user_id, "provider": "groq", "message_preview": preview}},
            )
            return {"response": self._fallback_response(message), "sources": []}

        try:
            choice = result.choices[0] if getattr(result, "choices", None) else None
            content = None if choice is None else getattr(getattr(choice, "message", None), "content", None)
            if content:
                return {"response": content, "sources": []}
            if isinstance(result, str):
                return {"response": result, "sources": []}
            if hasattr(result, "content") and result.content:
                return {"response": result.content, "sources": []}
            return {"response": str(result), "sources": []}
        except Exception as exc:
            self.logger.exception(
                "Failed to parse LLM result",
                exc_info=exc,
                extra={"extra_data": {"user_id": self.user_id, "provider": "groq"}},
            )
            return {"response": self._fallback_response(message), "sources": []}

    def _fallback_response(self, message: str) -> str:
        msg_lower = message.lower()
        if any(kw in msg_lower for kw in ["tiết kiệm", "tiet kiem", "save"]):
            return (
                "Để tiết kiệm hiệu quả, bạn nên áp dụng quy tắc 50/30/20, "
                "chuyển tiền tiết kiệm ngay khi nhận thu nhập và theo dõi những khoản chi lặp lại."
            )
        if any(kw in msg_lower for kw in ["đầu tư", "dau tu", "invest"]):
            return (
                "Nếu mới bắt đầu, hãy ưu tiên quỹ khẩn cấp, tránh nợ xấu, "
                "sau đó mới xem các kênh đầu tư đa dạng và phù hợp mức rủi ro của bạn."
            )
        if any(kw in msg_lower for kw in ["ngân sách", "ngan sach", "budget", "chi tiêu", "chi tieu"]):
            return (
                "Bạn nên đặt hạn mức theo danh mục, theo dõi chi phí hằng ngày và đánh giá lại mỗi cuối tháng "
                "để cắt bỏ các khoản vượt nhu cầu."
            )
        return (
            "Tôi có thể hỗ trợ về ngân sách, tiết kiệm, quỹ khẩn cấp, quản lý nợ và mục tiêu tài chính. "
            "Bạn hãy nói rõ hơn mục bạn muốn hỏi."
        )
