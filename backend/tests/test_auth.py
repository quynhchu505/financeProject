def test_register_login_refresh(client):
    register = client.post(
        "/api/v1/auth/register",
        json={"email": "demo@example.com", "password": "secret123", "name": "Demo"},
    )
    assert register.status_code == 201

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@example.com", "password": "secret123"},
    )
    assert login.status_code == 200
    payload = login.json()
    assert payload["access_token"]
    assert payload["refresh_token"]

    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": payload["refresh_token"]})
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]
