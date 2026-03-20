from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, ChatHistory
from app.schemas.schemas import ChatMessage, ChatResponse
from app.services.chatbot import FinanceChatbot
from app.api.deps import get_current_user

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    data: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Chat with the financial advisor bot."""
    chatbot = FinanceChatbot(current_user.id)
    result = chatbot.chat(data.message)

    # Save to history
    history = ChatHistory(
        user_id=current_user.id,
        message=data.message,
        response=result["response"],
    )
    db.add(history)
    db.commit()

    return ChatResponse(
        response=result["response"],
        sources=result.get("sources"),
    )
