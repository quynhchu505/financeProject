from conftest import auth_headers


class FakeFinanceChatbot:
    def __init__(self, user_id: int):
        self.user_id = user_id

    def chat(self, message: str) -> dict:
        return {"response": "Endpoint chatbot Groq OK", "sources": []}


def test_chatbot_creates_session_and_history(client, monkeypatch):
    monkeypatch.setattr("app.api.chatbot.FinanceChatbot", FakeFinanceChatbot)

    headers = auth_headers(client)
    response = client.post("/api/v1/chatbot/chat", headers=headers, json={"message": "Toi muon tiet kiem tien"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["response"] == "Endpoint chatbot Groq OK"
    assert payload["session_id"] is not None

    sessions = client.get("/api/v1/chatbot/sessions/", headers=headers)
    assert sessions.status_code == 200
    assert len(sessions.json()) == 1
