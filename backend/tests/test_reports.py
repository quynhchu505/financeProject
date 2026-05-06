from conftest import auth_headers


def test_report_exports(client):
    headers = auth_headers(client)

    csv_response = client.get("/api/v1/reports/export/csv?months=3", headers=headers)
    assert csv_response.status_code == 200
    assert "text/csv" in csv_response.headers["content-type"]
    assert "attachment;" in csv_response.headers["content-disposition"]

    pdf_response = client.get("/api/v1/reports/export/pdf?months=3", headers=headers)
    assert pdf_response.status_code == 200
    assert "application/pdf" in pdf_response.headers["content-type"]
