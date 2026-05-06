import os
import sys
from pathlib import Path

import pytest


TEST_DB_PATH = Path(__file__).resolve().parent / "test.db"
BACKEND_ROOT = TEST_DB_PATH.parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["REDIS_URL"] = "redis://localhost:6379"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["LLM_PROVIDER"] = "ollama"
os.environ["ENABLE_BACKGROUND_JOBS"] = "false"

from fastapi.testclient import TestClient

from app.core.rate_limit import _WINDOWS
from app.core.database import Base, SessionLocal, engine
from main import app


@pytest.fixture(autouse=True)
def reset_db():
    _WINDOWS.clear()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    SessionLocal.remove if hasattr(SessionLocal, "remove") else None


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


def auth_headers(client: TestClient, email: str = "demo@example.com", password: str = "secret123"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password, "name": "Demo"})
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
