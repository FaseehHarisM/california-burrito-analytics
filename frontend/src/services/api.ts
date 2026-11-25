import { FilterState, KPISummary, RevenueTrendItem, OrdersTrendItem, CategoryPerformanceItem, DistributionItem, ProductPerformanceItem, OutletPerformanceItem, PaginatedOrdersResponse, OrderDetail, FilterOptions, HealthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

function buildQuery(filters?: FilterState, extra?: Record<string, any>): string {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set('start_date', filters.startDate);
  if (filters?.endDate) params.set('end_date', filters.endDate);
  if (filters?.outlet) params.set('outlet', filters.outlet);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.orderType) params.set('order_type', filters.orderType);
  if (filters?.settlement) params.set('settlement', filters.settlement);

  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v));
      }
    });
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getFilters(): Promise<FilterOptions> {
    const res = await fetch(`${API_BASE}/api/filters`);
    if (!res.ok) throw new Error('Failed to load filter options');
    return res.json();
  },

  async getDashboardSummary(filters?: FilterState): Promise<KPISummary> {
    const res = await fetch(`${API_BASE}/api/dashboard/summary${buildQuery(filters)}`);
    if (!res.ok) throw new Error('Failed to load dashboard summary');
    return res.json();
  },

  async getRevenueTrend(filters?: FilterState, aggregation: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<RevenueTrendItem[]> {
    const res = await fetch(`${API_BASE}/api/dashboard/revenue-trend${buildQuery(filters, { aggregation })}`);
    if (!res.ok) throw new Error('Failed to load revenue trend');
    return res.json();
  },

  async getOrdersTrend(filters?: FilterState, aggregation: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<OrdersTrendItem[]> {
    const res = await fetch(`${API_BASE}/api/dashboard/orders-trend${buildQuery(filters, { aggregation })}`);
    if (!res.ok) throw new Error('Failed to load orders trend');
    return res.json();
  },

  async getCategoryPerformance(filters?: FilterState): Promise<CategoryPerformanceItem[]> {
    const res = await fetch(`${API_BASE}/api/dashboard/category-performance${buildQuery(filters)}`);
    if (!res.ok) throw new Error('Failed to load category performance');
    return res.json();
  },

  async getOrderTypeDistribution(filters?: FilterState): Promise<DistributionItem[]> {
    const res = await fetch(`${API_BASE}/api/dashboard/order-type-distribution${buildQuery(filters)}`);
    if (!res.ok) throw new Error('Failed to load order type distribution');
    return res.json();
  },

  async getPaymentDistribution(filters?: FilterState): Promise<DistributionItem[]> {
    const res = await fetch(`${API_BASE}/api/dashboard/payment-distribution${buildQuery(filters)}`);
    if (!res.ok) throw new Error('Failed to load payment distribution');
    return res.json();
  },

  async getTopProducts(filters?: FilterState, limit = 10, orderBy: 'quantity' | 'revenue' = 'quantity'): Promise<ProductPerformanceItem[]> {
    const res = await fetch(`${API_BASE}/api/dashboard/top-products${buildQuery(filters, { limit, order_by: orderBy })}`);
    if (!res.ok) throw new Error('Failed to load top products');
    return res.json();
  },

  async getOutletPerformance(filters?: FilterState): Promise<OutletPerformanceItem[]> {
    const res = await fetch(`${API_BASE}/api/dashboard/outlet-performance${buildQuery(filters)}`);
    if (!res.ok) throw new Error('Failed to load outlet performance');
    return res.json();
  },

  async getSalesAnalytics(filters?: FilterState): Promise<any> {
    const res = await fetch(`${API_BASE}/api/analytics/sales${buildQuery(filters)}`);
    if (!res.ok) throw new Error('Failed to load sales analytics');
    return res.json();
  },

  async getProductAnalytics(filters?: FilterState, search?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/analytics/products${buildQuery(filters, { search })}`);
    if (!res.ok) throw new Error('Failed to load product analytics');
    return res.json();
  },

  async getOutletAnalytics(filters?: FilterState, selectedOutlet?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/analytics/outlets${buildQuery(filters, { selected_outlet: selectedOutlet })}`);
    if (!res.ok) throw new Error('Failed to load outlet analytics');
    return res.json();
  },

  async getOrders(
    filters?: FilterState,
    page = 1,
    limit = 20,
    search?: string,
    sortBy = 'order_datetime',
    sortOrder = 'DESC'
  ): Promise<PaginatedOrdersResponse> {
    const res = await fetch(`${API_BASE}/api/orders${buildQuery(filters, { page, limit, search, sort_by: sortBy, sort_order: sortOrder })}`);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async getOrderDetails(billNo: number): Promise<OrderDetail> {
    const res = await fetch(`${API_BASE}/api/orders/${billNo}`);
    if (!res.ok) throw new Error(`Failed to load order #${billNo}`);
    return res.json();
  },

  getExportUrl(filters?: FilterState, search?: string): string {
    return `${API_BASE}/api/export${buildQuery(filters, { search })}`;
  }
};
