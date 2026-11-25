export interface FilterState {
  startDate?: string;
  endDate?: string;
  outlet?: string;
  category?: string;
  orderType?: string;
  settlement?: string;
}

export interface KPISummary {
  total_revenue: number;
  total_orders: number;
  total_items_sold: number;
  avg_order_value: number;
  avg_items_per_order: number;
  total_outlets: number;
  top_outlet: {
    name: string;
    revenue: number;
    share_pct: number;
  };
  top_category: {
    name: string;
    revenue: number;
    share_pct: number;
  };
  top_product: {
    name: string;
    category: string;
    revenue: number;
    quantity: number;
  };
}

export interface RevenueTrendItem {
  period: string;
  revenue: number;
  orders: number;
  items: number;
  aov: number;
}

export interface OrdersTrendItem {
  period: string;
  orders: number;
  revenue: number;
}

export interface CategoryPerformanceItem {
  category: string;
  revenue: number;
  quantity: number;
  orders: number;
  share_pct: number;
}

export interface DistributionItem {
  name: string;
  revenue: number;
  orders: number;
  share_pct: number;
}

export interface ProductPerformanceItem {
  rank: number;
  product: string;
  category: string;
  quantity_sold: number;
  total_revenue: number;
  avg_selling_price: number;
  revenue_contribution_pct: number;
}

export interface OutletPerformanceItem {
  outlet_name: string;
  revenue: number;
  orders: number;
  aov: number;
  items_sold: number;
  share_pct: number;
}

export interface OrderLineItem {
  item: string;
  category: string;
  unit_price: number;
  quantity: number;
  line_revenue: number;
}

export interface OrderDetail {
  bill_no: number;
  order_datetime: string;
  order_date: string;
  outlet: string;
  brand: string;
  order_type: string;
  settlement: string;
  line_items_count: number;
  total_quantity: number;
  order_revenue: number;
  items?: OrderLineItem[];
}

export interface PaginatedOrdersResponse {
  orders: OrderDetail[];
  total_orders: number;
  total_pages: number;
  page: number;
  limit: number;
}

export interface FilterOptions {
  outlets: string[];
  categories: string[];
  order_types: string[];
  settlements: string[];
  date_range: [string, string];
}

export interface HealthResponse {
  status: string;
  database_records: number;
  unique_bills: number;
  timestamp: string;
}
