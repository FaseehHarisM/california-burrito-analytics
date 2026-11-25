import { FilterState, KPISummary, RevenueTrendItem, CategoryPerformanceItem, DistributionItem, ProductPerformanceItem, OutletPerformanceItem, PaginatedOrdersResponse, OrderDetail, FilterOptions, HealthResponse } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

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

async function fetchJson<T>(url: string, errorLabel: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(errorLabel);
  return res.json();
}

export const api = {
  getHealth(signal?: AbortSignal): Promise<HealthResponse> {
    return fetchJson(`${API_BASE}/api/health`, 'Health check failed', signal);
  },

  getFilters(signal?: AbortSignal): Promise<FilterOptions> {
    return fetchJson(`${API_BASE}/api/filters`, 'Failed to load filter options', signal);
  },

  getDashboardSummary(filters?: FilterState, signal?: AbortSignal): Promise<KPISummary> {
    return fetchJson(`${API_BASE}/api/dashboard/summary${buildQuery(filters)}`, 'Failed to load dashboard summary', signal);
  },

  getRevenueTrend(
    filters?: FilterState,
    aggregation: 'daily' | 'weekly' | 'monthly' = 'daily',
    signal?: AbortSignal
  ): Promise<RevenueTrendItem[]> {
    return fetchJson(`${API_BASE}/api/dashboard/revenue-trend${buildQuery(filters, { aggregation })}`, 'Failed to load revenue trend', signal);
  },

  getCategoryPerformance(filters?: FilterState, signal?: AbortSignal): Promise<CategoryPerformanceItem[]> {
    return fetchJson(`${API_BASE}/api/dashboard/category-performance${buildQuery(filters)}`, 'Failed to load category performance', signal);
  },

  getOrderTypeDistribution(filters?: FilterState, signal?: AbortSignal): Promise<DistributionItem[]> {
    return fetchJson(`${API_BASE}/api/dashboard/order-type-distribution${buildQuery(filters)}`, 'Failed to load order type distribution', signal);
  },

  getPaymentDistribution(filters?: FilterState, signal?: AbortSignal): Promise<DistributionItem[]> {
    return fetchJson(`${API_BASE}/api/dashboard/payment-distribution${buildQuery(filters)}`, 'Failed to load payment distribution', signal);
  },

  getTopProducts(
    filters?: FilterState,
    limit = 10,
    orderBy: 'quantity' | 'revenue' = 'quantity',
    signal?: AbortSignal
  ): Promise<ProductPerformanceItem[]> {
    return fetchJson(`${API_BASE}/api/dashboard/top-products${buildQuery(filters, { limit, order_by: orderBy })}`, 'Failed to load top products', signal);
  },

  getOutletPerformance(filters?: FilterState, signal?: AbortSignal): Promise<OutletPerformanceItem[]> {
    return fetchJson(`${API_BASE}/api/dashboard/outlet-performance${buildQuery(filters)}`, 'Failed to load outlet performance', signal);
  },

  getSalesAnalytics(filters?: FilterState, signal?: AbortSignal): Promise<any> {
    return fetchJson(`${API_BASE}/api/analytics/sales${buildQuery(filters)}`, 'Failed to load sales analytics', signal);
  },

  getProductAnalytics(filters?: FilterState, search?: string, signal?: AbortSignal): Promise<any> {
    return fetchJson(`${API_BASE}/api/analytics/products${buildQuery(filters, { search })}`, 'Failed to load product analytics', signal);
  },

  getOutletAnalytics(filters?: FilterState, selectedOutlet?: string, signal?: AbortSignal): Promise<any> {
    return fetchJson(`${API_BASE}/api/analytics/outlets${buildQuery(filters, { selected_outlet: selectedOutlet })}`, 'Failed to load outlet analytics', signal);
  },

  getOrders(
    filters?: FilterState,
    page = 1,
    limit = 20,
    search?: string,
    sortBy = 'order_datetime',
    sortOrder = 'DESC',
    signal?: AbortSignal
  ): Promise<PaginatedOrdersResponse> {
    return fetchJson(
      `${API_BASE}/api/orders${buildQuery(filters, { page, limit, search, sort_by: sortBy, sort_order: sortOrder })}`,
      'Failed to load orders',
      signal
    );
  },

  getOrderDetails(billNo: number, signal?: AbortSignal): Promise<OrderDetail> {
    return fetchJson(`${API_BASE}/api/orders/${billNo}`, `Failed to load order #${billNo}`, signal);
  },

  getExportUrl(filters?: FilterState, search?: string): string {
    return `${API_BASE}/api/export${buildQuery(filters, { search })}`;
  }
};
