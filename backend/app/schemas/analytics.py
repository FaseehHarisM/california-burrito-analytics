from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class FilterParams(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    outlet: Optional[str] = None
    category: Optional[str] = None
    order_type: Optional[str] = None
    settlement: Optional[str] = None

class KPISummary(BaseModel):
    total_revenue: float
    total_orders: int
    total_items_sold: int
    avg_order_value: float
    avg_items_per_order: float
    total_outlets: int
    top_outlet: Dict[str, Any]
    top_category: Dict[str, Any]
    top_product: Dict[str, Any]

class RevenueTrendItem(BaseModel):
    period: str
    revenue: float
    orders: int
    items: int
    aov: float

class OrdersTrendItem(BaseModel):
    period: str
    orders: int
    revenue: float

class CategoryPerformanceItem(BaseModel):
    category: str
    revenue: float
    quantity: int
    orders: int
    share_pct: float

class DistributionItem(BaseModel):
    name: str
    revenue: float
    orders: int
    share_pct: float

class ProductPerformanceItem(BaseModel):
    product: str
    category: str
    quantity_sold: int
    total_revenue: float
    avg_selling_price: float
    revenue_contribution_pct: float
    rank: int

class OutletPerformanceItem(BaseModel):
    outlet_name: str
    revenue: float
    orders: int
    aov: float
    items_sold: int
    share_pct: float

class OrderLineItem(BaseModel):
    item: str
    category: str
    unit_price: float
    quantity: float
    line_revenue: float

class OrderDetail(BaseModel):
    bill_no: int
    order_datetime: str
    order_date: str
    outlet: str
    brand: str
    order_type: str
    settlement: str
    line_items_count: int
    total_quantity: float
    order_revenue: float
    items: Optional[List[OrderLineItem]] = None

class PaginatedOrdersResponse(BaseModel):
    orders: List[OrderDetail]
    total_orders: int
    total_pages: int
    page: int
    limit: int

class FilterOptions(BaseModel):
    outlets: List[str]
    categories: List[str]
    order_types: List[str]
    settlements: List[str]
    date_range: List[str]

class HealthResponse(BaseModel):
    status: str
    database_records: int
    unique_bills: int
    timestamp: str
