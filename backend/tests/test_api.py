import os
import sys
import unittest
from fastapi.testclient import TestClient

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app


class AnalyticsRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_and_health(self):
        r_root = self.client.get("/")
        self.assertEqual(r_root.status_code, 200)
        self.assertIn("California Burrito", r_root.json()["service"])

        r_health = self.client.get("/api/health")
        self.assertEqual(r_health.status_code, 200)
        data = r_health.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["database_records"], 300000)
        self.assertEqual(data["unique_bills"], 110478)
        self.assertIn("X-Process-Time-Ms", r_health.headers)

    def test_summary_exact_math(self):
        r = self.client.get("/api/dashboard/summary")
        self.assertEqual(r.status_code, 200)
        d = r.json()
        self.assertEqual(d["total_revenue"], 69480952.0)
        self.assertEqual(d["total_orders"], 110478)
        self.assertEqual(d["total_items_sold"], 434448)
        self.assertEqual(d["avg_order_value"], 628.91)
        self.assertEqual(d["avg_items_per_order"], 3.93)
        self.assertEqual(d["total_outlets"], 6)
        self.assertEqual(d["top_outlet"]["name"], "Koramangala")
        self.assertEqual(d["top_category"]["name"], "Burgers")

    def test_all_dashboard_endpoints(self):
        for ep in [
            "/api/filters",
            "/api/dashboard/revenue-trend?aggregation=daily",
            "/api/dashboard/revenue-trend?aggregation=weekly",
            "/api/dashboard/revenue-trend?aggregation=monthly",
            "/api/dashboard/orders-trend?aggregation=monthly",
            "/api/dashboard/category-performance",
            "/api/dashboard/order-type-distribution",
            "/api/dashboard/payment-distribution",
            "/api/dashboard/top-products?limit=10&order_by=quantity",
            "/api/dashboard/outlet-performance",
            "/api/analytics/sales",
            "/api/analytics/products",
            "/api/analytics/products?search=Shake",
            "/api/analytics/outlets",
        ]:
            res = self.client.get(ep)
            self.assertEqual(res.status_code, 200, f"Endpoint failed: {ep}")

    def test_outlet_drilldown_syncs_when_filtered_to_different_outlet(self):
        res = self.client.get("/api/analytics/outlets?outlet=Indiranagar&selected_outlet=Koramangala")
        self.assertEqual(res.status_code, 200)
        payload = res.json()
        self.assertEqual(len(payload["outlets_comparison"]), 1)
        self.assertEqual(payload["outlets_comparison"][0]["outlet_name"], "Indiranagar")
        self.assertEqual(payload["selected_outlet_drilldown"]["outlet_name"], "Indiranagar")
        self.assertGreater(len(payload["selected_outlet_drilldown"]["category_mix"]), 0)

    def test_orders_and_export_respect_category_filter(self):
        res = self.client.get("/api/orders?category=Burgers&page=1&limit=10")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_orders"], 70603)
        self.assertEqual(len(data["orders"]), 10)

        exp = self.client.get("/api/export?category=Burgers")
        self.assertEqual(exp.status_code, 200)
        self.assertIn("text/csv", exp.headers["content-type"])
        lines = exp.text.strip().splitlines()
        self.assertGreater(len(lines), 10)

    def test_order_details_valid_and_404(self):
        # First order from /orders
        listing = self.client.get("/api/orders?page=1&limit=1").json()
        bill_no = listing["orders"][0]["bill_no"]

        detail = self.client.get(f"/api/orders/{bill_no}")
        self.assertEqual(detail.status_code, 200)
        payload = detail.json()
        self.assertEqual(payload["bill_no"], bill_no)
        items_sum = round(sum(i["line_revenue"] for i in payload["items"]), 2)
        self.assertEqual(items_sum, payload["order_revenue"])

        missing = self.client.get("/api/orders/999999999")
        self.assertEqual(missing.status_code, 404)

    def test_date_validation_and_empty_filters(self):
        # Invalid date string -> HTTP 422
        bad = self.client.get("/api/dashboard/summary?start_date=not-a-date")
        self.assertEqual(bad.status_code, 422)

        # Inverted date bounds -> HTTP 400
        inv = self.client.get("/api/dashboard/summary?start_date=2026-06-01&end_date=2025-07-01")
        self.assertEqual(inv.status_code, 400)

        # Empty valid date slice -> clean 0 / empty response
        empty = self.client.get("/api/dashboard/summary?start_date=2099-01-01&end_date=2099-01-02")
        self.assertEqual(empty.status_code, 200)
        self.assertEqual(empty.json()["total_orders"], 0)
        self.assertEqual(empty.json()["total_revenue"], 0.0)

    def test_sql_injection_inputs_parameterized_safely(self):
        inj = self.client.get("/api/dashboard/summary", params={"outlet": "' OR '1'='1"})
        self.assertEqual(inj.status_code, 200)
        self.assertEqual(inj.json()["total_orders"], 0)

        inj_search = self.client.get("/api/orders", params={"search": "%; DROP TABLE orders; --"})
        self.assertEqual(inj_search.status_code, 200)
        self.assertEqual(inj_search.json()["total_orders"], 0)


if __name__ == "__main__":
    unittest.main()
