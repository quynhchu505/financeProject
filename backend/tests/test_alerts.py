from app.core.database import SessionLocal
from app.models.models import Alert, MLLog
from conftest import auth_headers


def test_budget_alerts_and_anomaly_feedback(client):
    headers = auth_headers(client)

    account = client.post(
        "/api/v1/accounts/",
        headers=headers,
        json={"name": "Ví cảnh báo", "account_type": "cash", "currency": "VND", "icon": "wallet"},
    )
    assert account.status_code == 201
    account_id = account.json()["id"]

    categories = client.get("/api/v1/categories/", headers=headers).json()
    category_id = categories[0]["id"]

    budget = client.post(
        "/api/v1/budgets/",
        headers=headers,
        json={"category_id": category_id, "amount": 100000, "period": "monthly"},
    )
    assert budget.status_code == 201

    transaction = client.post(
        "/api/v1/transactions/",
        headers=headers,
        json={
            "account_id": account_id,
            "category_id": category_id,
            "amount": 90000,
            "transaction_type": "expense",
            "description": "Chi phí lớn",
            "date": "2026-05-06T10:00:00Z",
        },
    )
    assert transaction.status_code == 201

    alerts = client.get("/api/v1/alerts/", headers=headers)
    assert alerts.status_code == 200
    payload = alerts.json()
    assert any(item["alert_type"] in {"budget_warning", "budget_exceeded"} for item in payload)

    db = SessionLocal()
    try:
        anomaly = Alert(
            user_id=1,
            transaction_id=transaction.json()["id"],
            alert_type="anomaly",
            severity="medium",
            title="Giao dịch bất thường",
            message="Kiểm tra giao dịch này",
            anomaly_score=0.77,
        )
        db.add(anomaly)
        db.commit()
        db.refresh(anomaly)
        anomaly_id = anomaly.id
    finally:
        db.close()

    feedback = client.post(
        "/api/v1/ai/anomaly-feedback",
        headers=headers,
        json={"alert_id": anomaly_id, "verdict": "normal"},
    )
    assert feedback.status_code == 200

    db = SessionLocal()
    try:
        updated_alert = db.query(Alert).filter(Alert.id == anomaly_id).first()
        logs = db.query(MLLog).filter(MLLog.model_type == "anomaly_feedback").all()
        assert updated_alert is not None
        assert updated_alert.is_read is True
        assert updated_alert.is_resolved is True
        assert len(logs) == 1
    finally:
        db.close()
