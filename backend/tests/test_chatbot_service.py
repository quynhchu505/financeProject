from app.services import chatbot as chatbot_module
from app.services.chatbot import FinanceChatbot


class _FakeMessage:
    def __init__(self, content: str):
        self.content = content


class _FakeChoice:
    def __init__(self, content: str):
        self.message = _FakeMessage(content)


class _FakeResult:
    def __init__(self, content: str):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def __init__(self):
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return _FakeResult("Tôi khuyên bạn nên theo dõi chi tiêu theo danh mục.")


class _FakeGroqClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.chat = type("ChatNamespace", (), {"completions": _FakeCompletions()})()


def test_finance_chatbot_uses_groq(monkeypatch):
    monkeypatch.setattr(chatbot_module, "GROQ_AVAILABLE", True)
    monkeypatch.setattr(chatbot_module, "Groq", _FakeGroqClient)
    monkeypatch.setattr(chatbot_module.settings, "GROQ_API_KEY", "test-key")
    monkeypatch.setattr(chatbot_module.settings, "GROQ_MODEL", "test-model")
    monkeypatch.setattr(chatbot_module.settings, "ALLOW_EXTERNAL_FINANCE_CONTEXT", False)

    bot = FinanceChatbot(user_id=1)
    result = bot.chat("Tôi muốn tiết kiệm tiền")

    assert result["response"] == "Tôi khuyên bạn nên theo dõi chi tiêu theo danh mục."
    assert result["sources"] == []
    assert bot.client.api_key == "test-key"
    assert bot.client.chat.completions.calls[0]["model"] == "test-model"
    assert bot.client.chat.completions.calls[0]["messages"][1]["content"] == "Tôi muốn tiết kiệm tiền"
