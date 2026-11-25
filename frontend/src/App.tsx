import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ActiveTab } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { SalesAnalyticsPage } from './pages/SalesAnalyticsPage';
import { ProductAnalyticsPage } from './pages/ProductAnalyticsPage';
import { OutletPerformancePage } from './pages/OutletPerformancePage';
import { OrdersTransactionsPage } from './pages/OrdersTransactionsPage';
import {
  FilterState,
  FilterOptions,
  KPISummary,
  RevenueTrendItem,
  CategoryPerformanceItem,
  DistributionItem,
  ProductPerformanceItem,
  OutletPerformanceItem,
} from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [filters, setFilters] = useState<FilterState>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  // Overview Data States
  const [summary, setSummary] = useState<KPISummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([]);
  const [categories, setCategories] = useState<CategoryPerformanceItem[]>([]);
  const [orderTypes, setOrderTypes] = useState<DistributionItem[]>([]);
  const [settlements, setSettlements] = useState<DistributionItem[]>([]);
  const [topProducts, setTopProducts] = useState<ProductPerformanceItem[]>([]);
  const [outlets, setOutlets] = useState<OutletPerformanceItem[]>([]);
  const [trendAggregation, setTrendAggregation] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const [isLoading, setIsLoading] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const filtersRef = useRef<FilterState>(filters);
  const aggRef = useRef<'daily' | 'weekly' | 'monthly'>(trendAggregation);
  filtersRef.current = filters;
  aggRef.current = trendAggregation;

  // Derive ordersTrend from revenueTrend directly (avoids a duplicate API round-trip)
  const ordersTrend = useMemo(
    () => revenueTrend.map((t) => ({ period: t.period, orders: t.orders, revenue: t.revenue })),
    [revenueTrend]
  );

  // Load Filter Options & Health check on mount
  useEffect(() => {
    const ctrl = new AbortController();
    api.getHealth(ctrl.signal)
      .then(() => setIsBackendHealthy(true))
      .catch((err) => {
        if (err.name !== 'AbortError') setIsBackendHealthy(false);
      });

    api.getFilters(ctrl.signal)
      .then((opts) => {
        setFilterOptions(opts);
        setFilters({
          startDate: opts.date_range[0],
          endDate: opts.date_range[1],
        });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to initialize filters:', err);
      });

    return () => ctrl.abort();
  }, []);

  // Fetch Overview Data when filters change
  const loadOverviewData = useCallback(async (currentFilters: FilterState, agg: 'daily' | 'weekly' | 'monthly', signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const [sum, revTrend, cats, types, settles, prods, outls] = await Promise.all([
        api.getDashboardSummary(currentFilters, signal),
        api.getRevenueTrend(currentFilters, agg, signal),
        api.getCategoryPerformance(currentFilters, signal),
        api.getOrderTypeDistribution(currentFilters, signal),
        api.getPaymentDistribution(currentFilters, signal),
        api.getTopProducts(currentFilters, 10, 'quantity', signal),
        api.getOutletPerformance(currentFilters, signal),
      ]);

      setSummary(sum);
      setRevenueTrend(revTrend);
      setCategories(cats);
      setOrderTypes(types);
      setSettlements(settles);
      setTopProducts(prods);
      setOutlets(outls);
      setIsBackendHealthy(true);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Failed to load dashboard data:', err);
        setIsBackendHealthy(false);
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  // Reload all overview widgets when filters change
  useEffect(() => {
    if (!filters.startDate) return;
    const ctrl = new AbortController();
    loadOverviewData(filters, aggRef.current, ctrl.signal);
    return () => ctrl.abort();
  }, [filters, loadOverviewData]);

  // Reload ONLY trend endpoint when user switches Daily / Weekly / Monthly granularity
  const handleAggregationChange = useCallback(async (agg: 'daily' | 'weekly' | 'monthly') => {
    setTrendAggregation(agg);
    if (!filtersRef.current.startDate) return;
    try {
      const revTrend = await api.getRevenueTrend(filtersRef.current, agg);
      setRevenueTrend(revTrend);
    } catch (err) {
      console.error('Failed to update trend granularity:', err);
    }
  }, []);

  const handleApplyFilters = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    if (filterOptions) {
      setFilters({
        startDate: filterOptions.date_range[0],
        endDate: filterOptions.date_range[1],
        outlet: undefined,
        category: undefined,
        orderType: undefined,
        settlement: undefined,
      });
    }
  };

  const handleRefresh = () => {
    loadOverviewData(filters, trendAggregation);
  };

  const handleExport = () => {
    const url = api.getExportUrl(filters);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      filters={filters}
      filterOptions={filterOptions}
      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
      onRefresh={handleRefresh}
      onExport={handleExport}
      isLoading={isLoading}
      isBackendHealthy={isBackendHealthy}
    >
      {activeTab === 'overview' && (
        <OverviewPage
          summary={summary}
          revenueTrend={revenueTrend}
          ordersTrend={ordersTrend}
          categories={categories}
          orderTypes={orderTypes}
          settlements={settlements}
          topProducts={topProducts}
          outlets={outlets}
          trendAggregation={trendAggregation}
          onAggregationChange={handleAggregationChange}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'sales' && (
        <SalesAnalyticsPage filters={filters} />
      )}

      {activeTab === 'products' && (
        <ProductAnalyticsPage filters={filters} />
      )}

      {activeTab === 'outlets' && (
        <OutletPerformancePage filters={filters} />
      )}

      {activeTab === 'orders' && (
        <OrdersTransactionsPage filters={filters} />
      )}
    </DashboardLayout>
  );
}

export default App;
