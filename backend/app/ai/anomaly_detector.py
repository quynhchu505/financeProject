import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Optional
import pandas as pd


class AnomalyDetector:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.model = None
        self.scaler = StandardScaler()
        self.trained_categories = {}

    def train(self, transactions: List[dict]) -> dict:
        """Train anomaly detection per category."""
        if len(transactions) < 20:
            return {"error": "Need at least 20 transactions to train"}

        df = pd.DataFrame(transactions)
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")

        results = {}
        for category_id, group in df.groupby("category_id"):
            if len(group) < 5:
                continue

            # Features: amount, time of month, day of week
            features = pd.DataFrame({
                "amount": group["amount"].values,
                "day_of_month": group["date"].dt.day.values,
                "day_of_week": group["date"].dt.dayofweek.values,
                "month": group["date"].dt.month.values,
            })

            X = self.scaler.fit_transform(features)
            model = IsolationForest(contamination=0.1, random_state=42)
            model.fit(X)
            self.trained_categories[category_id] = model

            # Stats
            mean_amt = group["amount"].mean()
            std_amt = group["amount"].std()
            results[category_id] = {
                "mean": float(mean_amt),
                "std": float(std_amt) if std_amt > 0 else float(mean_amt * 0.3),
            }

        return results

    def detect(self, amount: float, category_id: int, day_of_month: int = None) -> Dict:
        """Detect if a transaction is anomalous."""
        if category_id not in self.trained_categories:
            return {"is_anomaly": False, "severity": "none", "deviation": 0.0}

        model = self.trained_categories[category_id]
        cat_stats = self.model if hasattr(self, "_stats") else None

        # Build feature vector
        features = np.array([[amount, day_of_month or 15, 0, 0]])
        X = self.scaler.transform(features)
        pred = model.predict(X)[0]
        score = model.score_samples(X)[0]

        if pred == -1:
            # Calculate z-score approximation
            severity = "low"
            if score < -0.9:
                severity = "high"
            elif score < -0.7:
                severity = "medium"

            return {
                "is_anomaly": True,
                "severity": severity,
                "deviation": round(float(abs(score)), 3),
            }

        return {"is_anomaly": False, "severity": "none", "deviation": 0.0}

    def get_budget_alerts(self, transactions: List[dict], budgets: List[dict]) -> List[Dict]:
        """Check spending against budgets for anomalies."""
        alerts = []
        df = pd.DataFrame(transactions)
        if df.empty:
            return alerts

        df["date"] = pd.to_datetime(df["date"])
        now = df["date"].max() if len(df) > 0 else pd.Timestamp.now()
        start_of_month = now.replace(day=1)

        df_month = df[df["date"] >= start_of_month]
        spending_by_cat = df_month.groupby("category_id")["amount"].sum()

        for budget in budgets:
            cat_id = budget["category_id"]
            budget_amount = budget["amount"]
            spent = float(spending_by_cat.get(cat_id, 0))
            percentage = (spent / budget_amount) * 100

            if percentage >= 100:
                severity = "high"
            elif percentage >= 80:
                severity = "medium"
            else:
                continue

            alerts.append({
                "category_id": cat_id,
                "category_name": budget.get("category_name", "Unknown"),
                "budget_amount": budget_amount,
                "spent_amount": round(spent, 2),
                "expected_amount": round(spent * 0.8, 2),
                "percentage": round(percentage, 1),
                "severity": severity,
            })

        return alerts
