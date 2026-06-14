import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.metrics import CHATBOT_DURATION, record_duration
from app.core.rate_limit import rate_limit
from app.models.models import User, ChatHistory, ChatSession
from app.schemas.schemas import ChatMessage, ChatResponse
from app.services.chatbot import FinanceChatbot
from app.api.deps import get_current_user

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
logger = logging.getLogger(__name__)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(rate_limit(30, 60))])
def chat(
    data: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Chat with the financial advisor bot."""
    try:
        chatbot = FinanceChatbot(current_user.id)
        with record_duration(CHATBOT_DURATION):
            result = chatbot.chat(data.message)
    except Exception as exc:
        logger.exception("Chatbot service failed", extra={"extra_data": {"user_id": current_user.id}})
        result = {
            "response": (
                "Xin lỗi, hiện tại trợ lý AI đang bận. Vui lòng thử lại sau vài giây."
            ),
            "sources": [],
        }

    if not isinstance(result, dict) or "response" not in result:
        result = {
            "response": (
                "Xin lỗi, hiện tại trợ lý AI không thể trả lời. Vui lòng thử lại sau vài giây."
            ),
            "sources": [],
        }

    response_text = str(result["response"])
    session_id = data.session_id

    try:
        if session_id is None:
            title = data.message[:50].strip() if len(data.message) > 50 else data.message.strip()
            if not title:
                title = "Phiên mới"
            session = ChatSession(user_id=current_user.id, title=title)
            db.add(session)
            db.flush()
            session_id = session.id
        else:
            session = (
                db.query(ChatSession)
                .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
                .first()
            )
            if not session:
                title = data.message[:50].strip() if len(data.message) > 50 else data.message.strip()
                session = ChatSession(user_id=current_user.id, title=title)
                db.add(session)
                db.flush()
                session_id = session.id
            else:
                session.updated_at = utcnow()

        history = ChatHistory(
            user_id=current_user.id,
            session_id=session_id,
            message=data.message,
            response=response_text,
        )
        db.add(history)
        db.commit()
    except Exception:
        logger.exception("Failed to save chatbot session/history", extra={"extra_data": {"user_id": current_user.id, "session_id": session_id}})
        db.rollback()

    return ChatResponse(
        response=response_text,
        sources=result.get("sources"),
        session_id=session_id,
    )
