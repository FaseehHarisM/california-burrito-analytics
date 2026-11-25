from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, Response
from fastapi.responses import StreamingResponse
import io
import csv

from app.schemas.analytics import (
    FilterParams,
    KPISummary,
    RevenueTrendItem,
    OrdersTrendItem,
    CategoryPerformanceItem,
    DistributionItem,
    ProductPerformanceItem,
    OutletPerformanceItem,
    PaginatedOrdersResponse,
    OrderDetail,
    FilterOptions,
    HealthResponse
)
from app.services.analytics_service import AnalyticsService
from app.database.connection import get_db_conn

router = APIRouter()

def parse_filters(
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    outlet: Optional[str] = Query(None, description="Outlet name or comma-separated list"),
    category: Optional[str] = Query(None, description="Category name or comma-separated list"),
    order_type: Optional[str] = Query(None, description="Order type (Dine-In, Delivery, Takeaway)"),
    settlement: Optional[str] = Query(None, description="Settlement method (Cash/Card/Coupon, etc.)")
) -> FilterParams:
    return FilterParams(
        start_date=start_date,
        end_date=end_date,
        outlet=outlet,
        category=category,
        order_type=order_type,
        settlement=settlement
    )

# 1. Health
@router.get("/health", response_model=HealthResponse, tags=["System"])
def get_health():
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM orders;")
        records = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM bills;")
        bills = cur.fetchone()[0]
        conn.close()
        return {
            "status": "healthy",
            "database_records": records,
            "unique_bills": bills,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

# 2. Filters
@router.get("/filters", response_model=FilterOptions, tags=["Filters"])
def get_filters():
    return AnalyticsService.get_filters()

# 3. Dashboard Summary
@router.get("/dashboard/summary", response_model=KPISummary, tags=["Dashboard"])
def get_dashboard_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_summary(f)

# 4. Revenue Trend
@router.get("/dashboard/revenue-trend", response_model=list[RevenueTrendItem], tags=["Dashboard"])
def get_revenue_trend(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None,
    aggregation: str = Query("daily", pattern="^(daily|weekly|monthly)$")
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_revenue_trend(f, aggregation)

# 5. Orders Trend
@router.get("/dashboard/orders-trend", response_model=list[OrdersTrendItem], tags=["Dashboard"])
def get_orders_trend(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None,
    aggregation: str = Query("daily", pattern="^(daily|weekly|monthly)$")
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_orders_trend(f, aggregation)

# 6. Category Performance
@router.get("/dashboard/category-performance", response_model=list[CategoryPerformanceItem], tags=["Dashboard"])
def get_category_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_category_performance(f)

# 7. Order Type Distribution
@router.get("/dashboard/order-type-distribution", response_model=list[DistributionItem], tags=["Dashboard"])
def get_order_type_distribution(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_order_type_distribution(f)

# 8. Payment Distribution
@router.get("/dashboard/payment-distribution", response_model=list[DistributionItem], tags=["Dashboard"])
def get_payment_distribution(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_payment_distribution(f)

# 9. Top Products
@router.get("/dashboard/top-products", response_model=list[ProductPerformanceItem], tags=["Dashboard"])
def get_top_products(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    order_by: str = Query("quantity", pattern="^(quantity|revenue)$")
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_top_products(f, limit, order_by)

# 10. Outlet Performance
@router.get("/dashboard/outlet-performance", response_model=list[OutletPerformanceItem], tags=["Dashboard"])
def get_outlet_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_outlet_performance(f)

# 11. Sales Analytics Page API
@router.get("/analytics/sales", tags=["Analytics"])
def get_sales_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_sales_analytics(f)

# 12. Products Analytics Page API
@router.get("/analytics/products", tags=["Analytics"])
def get_product_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None,
    search: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_product_analytics(f, search)

# 13. Outlets Analytics Page API
@router.get("/analytics/outlets", tags=["Analytics"])
def get_outlet_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None,
    selected_outlet: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_outlet_analytics(f, selected_outlet)

# 14. Orders List (Server-side Pagination & Search)
@router.get("/orders", response_model=PaginatedOrdersResponse, tags=["Orders"])
def get_orders(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: str = Query("order_datetime", pattern="^(bill_no|order_datetime|outlet_name|total_revenue|total_quantity)$"),
    sort_order: str = Query("DESC", pattern="^(ASC|DESC|asc|desc)$")
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    return AnalyticsService.get_orders(f, page, limit, search, sort_by, sort_order)

# 15. Order Details (Individual Line Items)
@router.get("/orders/{bill_no}", response_model=OrderDetail, tags=["Orders"])
def get_order_details(bill_no: int):
    order = AnalyticsService.get_order_details(bill_no)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order with BillNo #{bill_no} not found")
    return order

# 16. CSV Export Endpoint
@router.get("/export", tags=["Export"])
def export_orders_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    outlet: Optional[str] = None,
    category: Optional[str] = None,
    order_type: Optional[str] = None,
    settlement: Optional[str] = None,
    search: Optional[str] = None
):
    f = FilterParams(
        start_date=start_date, end_date=end_date, outlet=outlet,
        category=category, order_type=order_type, settlement=settlement
    )
    # Fetch first 1000 orders matching filter
    data = AnalyticsService.get_orders(f, page=1, limit=1000, search=search)
    orders = data["orders"]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "BillNo", "Order_Datetime", "Order_Date", "Outlet",
        "Brand", "Order_Type", "Settlement", "Line_Items_Count",
        "Total_Quantity", "Order_Revenue"
    ])

    for o in orders:
        writer.writerow([
            o["bill_no"], o["order_datetime"], o["order_date"], o["outlet"],
            o["brand"], o["order_type"], o["settlement"], o["line_items_count"],
            o["total_quantity"], o["order_revenue"]
        ])

    output.seek(0)
    filename = f"california_burrito_orders_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
