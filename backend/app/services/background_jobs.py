import threading
import time

from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.core.metrics import ANOMALY_DETECTED_TOTAL, ANOMALY_SCAN_DURATION, record_duration
from app.core.database import SessionLocal
from app.models.models import Alert, Category, Transaction, TransactionType, User

logger = get_logger(__name__)


def _scan_user_anomalies(db: Session, user: User):
    from app.ai.anomaly_detector import AnomalyDetector

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user.id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE.value,
            Transaction.category_id.isnot(None),
        )
        .order_by(Transaction.date.asc())
        .all()
    )
    if len(transactions) < 20:
        return

    with record_duration(ANOMALY_SCAN_DURATION):
        detector = AnomalyDetector(user.id)
        detector.train(
            [{"date": t.date, "amount": t.amount, "category_id": t.category_id, "type": t.transaction_type} for t in transactions]
        )

        for transaction in transactions[-20:]:
            existing = (
                db.query(Alert)
                .filter(Alert.user_id == user.id, Alert.transaction_id == transaction.id, Alert.alert_type == "anomaly")
                .first()
            )
            if existing:
                continue

            result = detector.detect(transaction.amount, transaction.category_id, transaction.date.day)
            if not result.get("is_anomaly"):
                continue

            category = db.query(Category).filter(Category.id == transaction.category_id).first()
            db.add(
                Alert(
                    user_id=user.id,
                    transaction_id=transaction.id,
                    alert_type="anomaly",
                    severity=result["severity"],
                    title=f"Giao dịch bất thường ở {category.name if category else 'Unknown'}",
                    message=f"Giao dịch {transaction.amount:,.0f} VND được phát hiện có dấu hiệu bất thường.",
                    anomaly_score=result.get("deviation"),
                )
            )
            ANOMALY_DETECTED_TOTAL.inc()


def run_anomaly_scan_once():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active.is_(True)).all()
        for user in users:
            _scan_user_anomalies(db, user)
        db.commit()
    except Exception:
        logger.exception("Background anomaly scan failed")
        db.rollback()
    finally:
        db.close()


def start_background_jobs():
    def worker():
        while True:
            run_anomaly_scan_once()
            time.sleep(6 * 60 * 60)

    thread = threading.Thread(target=worker, daemon=True, name="anomaly-scan-worker")
    thread.start()
    return thread
