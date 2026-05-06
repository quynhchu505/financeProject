from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.logging import get_logger
from app.core.metrics import AI_CLASSIFY_DURATION, ANOMALY_DETECTED_TOTAL, ANOMALY_SCAN_DURATION, record_duration
from app.core.rate_limit import rate_limit
from app.models.models import Alert, Category, MLLog, Transaction, TransactionType, User
from app.schemas.schemas import (
    AICategorizationRequest,
    AICategorizationResponse,
    AnomalyAlert,
    AnomalyFeedbackRequest,
    CashFlowPrediction,
    ClassifierFeedbackRequest,
)

router = APIRouter(prefix="/ai", tags=["AI"])
logger = get_logger(__name__)


def preprocess_text(text: str) -> str:
    return " ".join("".join(ch.lower() if ch.isalnum() or ch.isspace() else " " for ch in text).split())


@router.post("/categorize", response_model=AICategorizationResponse, dependencies=[Depends(rate_limit(30, 60))])
def categorize_transaction(
    request: AICategorizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.ai.transaction_classifier import TransactionClassifier

    with record_duration(AI_CLASSIFY_DURATION):
        classifier = TransactionClassifier(current_user.id)
        labeled = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.category_id.isnot(None),
                Transaction.deleted_at.is_(None),
            )
            .all()
        )
        if len(labeled) >= 10 and not classifier.is_trained:
            classifier.train(
                texts=[preprocess_text(t.description or "") for t in labeled],
                labels=[t.category_id for t in labeled],
            )

        category_id, confidence = classifier.predict(preprocess_text(request.description))
    if category_id == 0:
        default = db.query(Category).filter(Category.user_id == current_user.id).first()
        if default is None:
            raise HTTPException(status_code=404, detail="No categories found")
        return AICategorizationResponse(
            category_id=default.id,
            category_name=default.name,
            confidence=0.0,
            should_autofill=False,
        )

    category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Predicted category not found")

    db.add(
        MLLog(
            user_id=current_user.id,
            model_type="classifier",
            input_text=request.description,
            predicted_category_id=category_id,
            confidence_score=confidence,
        )
    )
    db.commit()

    return AICategorizationResponse(
        category_id=category_id,
        category_name=category.name,
        confidence=confidence,
        should_autofill=confidence >= 0.65,
    )


@router.post("/train-classifier", dependencies=[Depends(rate_limit(5, 300))])
def train_classifier(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.ai.transaction_classifier import TransactionClassifier

    labeled = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.category_id.isnot(None),
            Transaction.deleted_at.is_(None),
        )
        .all()
    )
    classifier = TransactionClassifier(current_user.id)
    return classifier.train(
        texts=[preprocess_text(t.description or "") for t in labeled],
        labels=[t.category_id for t in labeled],
    )


@router.post("/classifier-feedback")
def classifier_feedback(
    data: ClassifierFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = MLLog(
        user_id=current_user.id,
        transaction_id=data.transaction_id,
        model_type="classifier_feedback",
        input_text=data.description,
        predicted_category_id=data.predicted_category_id,
        actual_category_id=data.actual_category_id,
        is_correct=data.predicted_category_id == data.actual_category_id if data.predicted_category_id else True,
    )
    db.add(log)
    db.commit()
    logger.info("Classifier feedback saved", extra={"extra_data": {"user_id": current_user.id}})
    return {"status": "ok"}


@router.post("/anomaly-feedback")
def anomaly_feedback(
    data: AnomalyFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = (
        db.query(Alert)
        .filter(
            Alert.id == data.alert_id,
            Alert.user_id == current_user.id,
            Alert.alert_type == "anomaly",
        )
        .first()
    )
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    log = MLLog(
        user_id=current_user.id,
        transaction_id=alert.transaction_id,
        model_type="anomaly_feedback",
        input_text=alert.message,
        confidence_score=alert.anomaly_score,
        is_correct=data.verdict == "investigate",
    )
    alert.is_read = True
    alert.is_resolved = data.verdict == "normal"
    db.add(log)
    db.commit()
    logger.info(
        "Anomaly feedback saved",
        extra={"extra_data": {"user_id": current_user.id, "alert_id": alert.id, "verdict": data.verdict}},
    )
    return {"status": "ok"}


@router.get("/predict-cashflow", response_model=List[CashFlowPrediction])
def predict_cashflow(
    months: int = 3,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.ai.cash_flow_predictor import CashFlowPredictor

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type != TransactionType.TRANSFER.value,
        )
        .all()
    )
    tx_data = [{"date": t.date, "amount": t.amount, "type": t.transaction_type} for t in transactions]
    predictor = CashFlowPredictor(current_user.id)
    if len(tx_data) >= 30:
        predictor.train(tx_data)
    predictions = predictor.predict(tx_data, months)
    return [CashFlowPrediction(**p) for p in predictions]


@router.post("/anomaly-scan", response_model=List[AnomalyAlert], dependencies=[Depends(rate_limit(5, 300))])
def scan_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.ai.anomaly_detector import AnomalyDetector

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE.value,
            Transaction.category_id.isnot(None),
        )
        .order_by(Transaction.date.asc())
        .all()
    )
    if len(transactions) < 20:
        return []

    alerts: list[AnomalyAlert] = []
    with record_duration(ANOMALY_SCAN_DURATION):
        detector = AnomalyDetector(current_user.id)
        detector.train(
            [{"date": t.date, "amount": t.amount, "category_id": t.category_id, "type": t.transaction_type} for t in transactions]
        )

        for transaction in transactions[-20:]:
            result = detector.detect(
                amount=transaction.amount,
                category_id=transaction.category_id,
                day_of_month=transaction.date.day,
            )
            if not result.get("is_anomaly"):
                continue

            category = db.query(Category).filter(Category.id == transaction.category_id).first()
            alert_model = Alert(
                user_id=current_user.id,
                transaction_id=transaction.id,
                alert_type="anomaly",
                severity=result["severity"],
                title=f"Giao dịch bất thường ở {category.name if category else 'Unknown'}",
                message=(
                    f"Giao dịch {transaction.amount:,.0f} VND ngày {transaction.date.strftime('%d/%m/%Y')} "
                    f"được đánh dấu bất thường."
                ),
                anomaly_score=result.get("deviation"),
            )
            db.add(alert_model)
            ANOMALY_DETECTED_TOTAL.inc()
            alerts.append(
                AnomalyAlert(
                    transaction_id=transaction.id,
                    category_name=category.name if category else "Unknown",
                    expected_amount=max(transaction.amount * 0.7, 0),
                    actual_amount=transaction.amount,
                    deviation=result.get("deviation", 0),
                    severity=result["severity"],
                    score=result.get("deviation"),
                )
            )

    db.commit()
    logger.info("Anomaly scan finished", extra={"extra_data": {"user_id": current_user.id, "alerts": len(alerts)}})
    return alerts


@router.get("/anomaly-alerts", response_model=List[AnomalyAlert])
def get_anomaly_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = (
        db.query(Alert, Transaction, Category)
        .join(Transaction, Transaction.id == Alert.transaction_id)
        .outerjoin(Category, Category.id == Transaction.category_id)
        .filter(Alert.user_id == current_user.id, Alert.alert_type == "anomaly")
        .order_by(Alert.created_at.desc())
        .limit(50)
        .all()
    )

    return [
        AnomalyAlert(
            transaction_id=transaction.id if transaction else None,
            category_name=category.name if category else "Unknown",
            expected_amount=max((transaction.amount if transaction else 0) * 0.7, 0),
            actual_amount=transaction.amount if transaction else 0,
            deviation=alert.anomaly_score or 0,
            severity=alert.severity,
            score=alert.anomaly_score,
        )
        for alert, transaction, category in alerts
    ]
