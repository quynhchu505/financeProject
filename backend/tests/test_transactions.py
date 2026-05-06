from app.core.database import SessionLocal
from app.models.models import Account
from conftest import auth_headers


def test_transaction_updates_balance_and_soft_delete(client):
    headers = auth_headers(client)

    account = client.post(
        "/api/v1/accounts/",
        headers=headers,
        json={"name": "Ví", "account_type": "cash", "currency": "VND", "icon": "wallet"},
    )
    assert account.status_code == 201
    account_id = account.json()["id"]

    categories = client.get("/api/v1/categories/", headers=headers).json()
    category_id = categories[0]["id"]

    created = client.post(
        "/api/v1/transactions/",
        headers=headers,
        json={
            "account_id": account_id,
            "category_id": category_id,
            "amount": 100000,
            "transaction_type": "expense",
            "description": "Cafe",
            "date": "2026-05-06T10:00:00Z",
        },
    )
    assert created.status_code == 201
    transaction_id = created.json()["id"]

    db = SessionLocal()
    try:
        account_model = db.query(Account).filter(Account.id == account_id).first()
        assert round(account_model.balance, 2) == -100000
    finally:
        db.close()

    updated = client.put(
        f"/api/v1/transactions/{transaction_id}",
        headers=headers,
        json={"amount": 50000, "transaction_type": "income"},
    )
    assert updated.status_code == 200

    db = SessionLocal()
    try:
        account_model = db.query(Account).filter(Account.id == account_id).first()
        assert round(account_model.balance, 2) == 50000
    finally:
        db.close()

    deleted = client.delete(f"/api/v1/transactions/{transaction_id}", headers=headers)
    assert deleted.status_code == 204

    db = SessionLocal()
    try:
        account_model = db.query(Account).filter(Account.id == account_id).first()
        assert round(account_model.balance, 2) == 0
    finally:
        db.close()
