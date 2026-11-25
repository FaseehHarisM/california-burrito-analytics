export interface FilterState {
  startDate: string;
  endDate: string;
  outlets: string[];
  categories: string[];
  orderTypes: string[];
  settlements: string[];
  search?: string;
}

export interface KPIData {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  avgOrderValue: number;
  avgItemsPerOrder: number;
  topOutlet: { name: string; revenue: number; sharePct: number };
  topCategory: { name: string; revenue: number; sharePct: number };
  topItem: { name: string; revenue: number; quantity: number };
  filteredRecordsCount: number;
}

export interface DailyDataPoint {
  date: string;
  orders: number;
  revenue: number;
  items: number;
  aov: number;
}

export interface OutletMetric {
  outlet: string;
  orders: number;
  revenue: number;
  items: number;
  aov: number;
  sharePct: number;
}

export interface CategoryMetric {
  category: string;
  orders: number;
  revenue: number;
  items: number;
  sharePct: number;
}

export interface OrderTypeMetric {
  orderType: string;
  orders: number;
  revenue: number;
  items: number;
  aov: number;
  sharePct: number;
}

export interface SettlementMetric {
  settlement: string;
  orders: number;
  revenue: number;
  sharePct: number;
}

export interface TopItemMetric {
  rank: number;
  item: string;
  category: string;
  quantity: number;
  revenue: number;
  avgPrice: number;
  orders: number;
}

export interface HourlyMetric {
  hour: number;
  label: string;
  orders: number;
  revenue: number;
  items: number;
  aov: number;
}

export interface AIInsight {
  category: "revenue" | "operations" | "menu" | "channels";
  title: string;
  observation: string;
  recommendation: string;
  badge: string;
  type: "positive" | "warning" | "neutral" | "highlight";
}

export interface OrderItem {
  category: string;
  item: string;
  price: number;
  quantity: number;
  revenue: number;
}

export interface OrderRecord {
  bill_no: number;
  outlet: string;
  datetime: string;
  date: string;
  order_type: string;
  settlement: string;
  total_items: number;
  total_revenue: number;
  items: OrderItem[];
}

export interface AnalyticsResponse {
  kpis: KPIData;
  dailySeries: DailyDataPoint[];
  outletBreakdown: OutletMetric[];
  categoryBreakdown: CategoryMetric[];
  orderTypeBreakdown: OrderTypeMetric[];
  settlementBreakdown: SettlementMetric[];
  topItems: TopItemMetric[];
  hourlyDistribution: HourlyMetric[];
  aiInsights: AIInsight[];
  queryExecutionMs: number;
  filterOptions: {
    outlets: string[];
    categories: string[];
    orderTypes: string[];
    settlements: string[];
    dateRange: [string, string];
  };
}

export interface PaginatedOrdersResponse {
  orders: OrderRecord[];
  totalOrders: number;
  totalPages: number;
  page: number;
  limit: number;
}
