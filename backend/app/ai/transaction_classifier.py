import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from typing import List, Tuple, Optional
from app.core.config import settings


class TransactionClassifier:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.model_path = os.path.join(settings.AI_MODELS_PATH, f"classifier_{user_id}.pkl")
        self.vectorizer_path = os.path.join(settings.AI_MODELS_PATH, f"vectorizer_{user_id}.pkl")
        self.model = None
        self.vectorizer = None
        self.is_trained = False

    def train(self, texts: List[str], labels: List[int]) -> dict:
        """Train the classifier with labeled transaction data."""
        if len(texts) < 10:
            return {"error": "Need at least 10 samples to train"}

        self.vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
        X = self.vectorizer.fit_transform(texts)
        y = np.array(labels)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model = MultinomialNB(alpha=0.1)
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        # Save model
        os.makedirs(settings.AI_MODELS_PATH, exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.vectorizer, self.vectorizer_path)
        self.is_trained = True

        report = classification_report(y_test, y_pred, output_dict=True)
        return {
            "accuracy": accuracy,
            "precision": report["weighted avg"]["precision"],
            "recall": report["weighted avg"]["recall"],
            "f1": report["weighted avg"]["f1-score"],
        }

    def predict(self, description: str) -> Tuple[int, float]:
        """Predict category for a transaction description."""
        if not self.is_trained:
            self._load_model()
        if self.model is None:
            return 0, 0.0

        X = self.vectorizer.transform([description])
        pred = self.model.predict(X)[0]
        prob = self.model.predict_proba(X)[0].max()
        return int(pred), float(prob)

    def _load_model(self):
        if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
            self.model = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)
            self.is_trained = True
