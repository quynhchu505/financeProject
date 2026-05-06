from conftest import auth_headers


def test_chatbot_creates_session_and_history(client):
    headers = auth_headers(client)
    response = client.post("/api/v1/chatbot/chat", headers=headers, json={"message": "Toi muon tiet kiem tien"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["response"]
    assert payload["session_id"] is not None

    sessions = client.get("/api/v1/chatbot/sessions/", headers=headers)
    assert sessions.status_code == 200
    assert len(sessions.json()) == 1
