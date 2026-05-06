def test_health_and_metrics_endpoints(client):
    health = client.get("/health")
    assert health.status_code == 200
    health_payload = health.json()
    assert "components" in health_payload
    assert {"database", "redis", "ollama"} <= set(health_payload["components"].keys())

    metrics = client.get("/metrics")
    assert metrics.status_code == 200
    assert "http_requests_total" in metrics.text
