import pytest


@pytest.mark.asyncio
async def test_health_returns_200(http_client):
    response = await http_client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
