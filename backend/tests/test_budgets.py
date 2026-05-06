from conftest import auth_headers


def test_budget_create_update_list(client):
    headers = auth_headers(client)
    categories = client.get("/api/v1/categories/", headers=headers).json()
    category_id = categories[0]["id"]

    created = client.post(
        "/api/v1/budgets/",
        headers=headers,
        json={"category_id": category_id, "amount": 1000000, "period": "monthly"},
    )
    assert created.status_code == 201
    budget_id = created.json()["id"]

    listed = client.get("/api/v1/budgets/", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.put(
        f"/api/v1/budgets/{budget_id}",
        headers=headers,
        json={"amount": 2000000},
    )
    assert updated.status_code == 200
    assert updated.json()["amount"] == 2000000
