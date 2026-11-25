import React, { useState, useEffect, useCallback } from 'react';
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
  OrdersTrendItem, 
  CategoryPerformanceItem, 
  DistributionItem, 
  ProductPerformanceItem, 
  OutletPerformanceItem 
} from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [filters, setFilters] = useState<FilterState>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  // Overview Data States
  const [summary, setSummary] = useState<KPISummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([]);
  const [ordersTrend, setOrdersTrend] = useState<OrdersTrendItem[]>([]);
  const [categories, setCategories] = useState<CategoryPerformanceItem[]>([]);
  const [orderTypes, setOrderTypes] = useState<DistributionItem[]>([]);
  const [settlements, setSettlements] = useState<DistributionItem[]>([]);
  const [topProducts, setTopProducts] = useState<ProductPerformanceItem[]>([]);
  const [outlets, setOutlets] = useState<OutletPerformanceItem[]>([]);
  const [trendAggregation, setTrendAggregation] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const [isLoading, setIsLoading] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

  // Load Filter Options & Health check on mount
  useEffect(() => {
    api.getHealth()
      .then(() => setIsBackendHealthy(true))
      .catch(() => setIsBackendHealthy(false));

    api.getFilters()
      .then((opts) => {
        setFilterOptions(opts);
        setFilters({
          startDate: opts.date_range[0],
          endDate: opts.date_range[1],
        });
      })
      .catch((err) => console.error('Failed to initialize filters:', err));
  }, []);

  // Fetch Overview Data when filters or trendAggregation change
  const loadOverviewData = useCallback(async (currentFilters: FilterState, agg: 'daily' | 'weekly' | 'monthly') => {
    setIsLoading(true);
    try {
      const [sum, revTrend, ordTrend, cats, types, settles, prods, outls] = await Promise.all([
        api.getDashboardSummary(currentFilters),
        api.getRevenueTrend(currentFilters, agg),
        api.getOrdersTrend(currentFilters, agg),
        api.getCategoryPerformance(currentFilters),
        api.getOrderTypeDistribution(currentFilters),
        api.getPaymentDistribution(currentFilters),
        api.getTopProducts(currentFilters, 10, 'quantity'),
        api.getOutletPerformance(currentFilters),
      ]);

      setSummary(sum);
      setRevenueTrend(revTrend);
      setOrdersTrend(ordTrend);
      setCategories(cats);
      setOrderTypes(types);
      setSettlements(settles);
      setTopProducts(prods);
      setOutlets(outls);
      setIsBackendHealthy(true);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setIsBackendHealthy(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filters.startDate) {
      loadOverviewData(filters, trendAggregation);
    }
  }, [filters, trendAggregation, loadOverviewData]);

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
    window.open(url, '_blank');
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
          onAggregationChange={setTrendAggregation}
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
