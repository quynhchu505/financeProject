import time

from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "path", "status"])
REQUEST_DURATION = Histogram("http_request_duration_seconds", "HTTP request duration", ["method", "path"])
AI_CLASSIFY_DURATION = Histogram("ai_classify_duration_seconds", "AI classification duration")
CHATBOT_DURATION = Histogram("chatbot_duration_seconds", "Chatbot response duration")
ANOMALY_SCAN_DURATION = Histogram("anomaly_scan_duration_seconds", "Anomaly detection duration")
TRANSACTION_CREATED_TOTAL = Counter("transaction_created_total", "Total successful created transactions")
ANOMALY_DETECTED_TOTAL = Counter("anomaly_detected_total", "Detected anomaly alerts")


def metrics_response():
    return generate_latest(), CONTENT_TYPE_LATEST


class record_duration:
    def __init__(self, histogram):
        self.histogram = histogram
        self.start = 0.0

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.histogram.observe(time.perf_counter() - self.start)
