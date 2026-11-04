from fastapi.testclient import TestClient
from app.main import app


def test_health():
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_fallback_chat():
    response = TestClient(app).post("/api/chat", json={"message": "What should I do in an earthquake?"})
    assert response.status_code == 200
    assert response.json()["isFallback"] is True
    assert "Drop" in response.json()["answer"]


def test_rejects_empty_message():
    response = TestClient(app).post("/api/chat", json={"message": ""})
    assert response.status_code == 422
