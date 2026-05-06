from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


class AnomalyDetector:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.models: dict[int, IsolationForest] = {}
        self.scalers: dict[int, StandardScaler] = {}
        self.stats: dict[int, dict[str, float]] = {}

    def train(self, transactions: List[dict]) -> dict:
        if len(transactions) < 20:
            return {"error": "Need at least 20 transactions to train"}

        df = pd.DataFrame(transactions)
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")
        results = {}

        for category_id, group in df.groupby("category_id"):
            if category_id is None or len(group) < 5:
                continue

            features = pd.DataFrame(
                {
                    "amount": np.log1p(group["amount"].astype(float).values),
                    "day_of_month": group["date"].dt.day.values,
                    "day_of_week": group["date"].dt.dayofweek.values,
                    "hour_of_day": group["date"].dt.hour.values,
                }
            )

            scaler = StandardScaler()
            X = scaler.fit_transform(features)
            model = IsolationForest(contamination=0.1, random_state=42, n_estimators=100)
            model.fit(X)

            self.models[int(category_id)] = model
            self.scalers[int(category_id)] = scaler
            self.stats[int(category_id)] = {
                "mean": float(group["amount"].mean()),
                "std": float(group["amount"].std() or max(group["amount"].mean() * 0.2, 1)),
            }
            results[int(category_id)] = self.stats[int(category_id)]

        return results

    def detect(self, amount: float, category_id: int, day_of_month: int | None = None) -> Dict:
        if category_id not in self.models:
            return {"is_anomaly": False, "severity": "none", "deviation": 0.0}

        model = self.models[category_id]
        scaler = self.scalers[category_id]
        features = np.array([[np.log1p(amount), day_of_month or 15, 0, 12]])
        X = scaler.transform(features)
        prediction = model.predict(X)[0]
        score = float(model.score_samples(X)[0])
        deviation = abs(score)

        if prediction == -1:
            if deviation >= 0.75:
                severity = "high"
            elif deviation >= 0.55:
                severity = "medium"
            else:
                severity = "low"
            return {"is_anomaly": True, "severity": severity, "deviation": round(deviation, 3)}

        return {"is_anomaly": False, "severity": "none", "deviation": round(deviation, 3)}

    def get_budget_alerts(self, transactions: List[dict], budgets: List[dict]) -> List[Dict]:
        alerts = []
        df = pd.DataFrame(transactions)
        if df.empty:
            return alerts

        df["date"] = pd.to_datetime(df["date"])
        start_of_month = df["date"].max().replace(day=1)
        df_month = df[df["date"] >= start_of_month]
        spending_by_cat = df_month.groupby("category_id")["amount"].sum()

        for budget in budgets:
            cat_id = budget["category_id"]
            budget_amount = float(budget["amount"])
            if budget_amount <= 0:
                continue
            spent = float(spending_by_cat.get(cat_id, 0))
            percentage = (spent / budget_amount) * 100
            if percentage >= 100:
                severity = "high"
            elif percentage >= 80:
                severity = "medium"
            else:
                continue

            alerts.append(
                {
                    "category_id": cat_id,
                    "category_name": budget.get("category_name", "Unknown"),
                    "budget_amount": budget_amount,
                    "spent_amount": round(spent, 2),
                    "expected_amount": round(budget_amount, 2),
                    "actual_amount": round(spent, 2),
                    "deviation": round(max(spent - budget_amount, 0), 2),
                    "severity": severity,
                }
            )

        return alerts
