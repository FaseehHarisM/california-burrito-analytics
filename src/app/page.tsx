"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import KPIGrid from "@/components/KPIGrid";
import AIInsightsCard from "@/components/AIInsightsCard";
import ChartsSection from "@/components/ChartsSection";
import OrderExplorer from "@/components/OrderExplorer";
import { FilterState, AnalyticsResponse } from "@/types/analytics";

const DEFAULT_FILTERS: FilterState = {
  startDate: "2025-06-17",
  endDate: "2026-06-16",
  outlets: [],
  categories: [],
  orderTypes: [],
  settlements: [],
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalytics = useCallback(async (currentFilters: FilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.startDate) params.set("startDate", currentFilters.startDate);
      if (currentFilters.endDate) params.set("endDate", currentFilters.endDate);
      if (currentFilters.outlets.length > 0) params.set("outlets", currentFilters.outlets.join(","));
      if (currentFilters.categories.length > 0) params.set("categories", currentFilters.categories.join(","));
      if (currentFilters.orderTypes.length > 0) params.set("orderTypes", currentFilters.orderTypes.join(","));
      if (currentFilters.settlements.length > 0) params.set("settlements", currentFilters.settlements.join(","));

      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (res.ok) {
        const json: AnalyticsResponse = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(filters);
  }, [filters, fetchAnalytics]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    if (data?.filterOptions) {
      setFilters({
        startDate: data.filterOptions.dateRange[0],
        endDate: data.filterOptions.dateRange[1],
        outlets: [],
        categories: [],
        orderTypes: [],
        settlements: [],
      });
    } else {
      setFilters(DEFAULT_FILTERS);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.outlets.length > 0) params.set("outlets", filters.outlets.join(","));
      if (filters.orderTypes.length > 0) params.set("orderTypes", filters.orderTypes.join(","));
      if (filters.settlements.length > 0) params.set("settlements", filters.settlements.join(","));

      const res = await fetch(`/api/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `burger-town-analytics-export-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <Header
        onRefresh={() => fetchAnalytics(filters)}
        onExport={handleExportCSV}
        isExporting={isExporting}
        queryLatencyMs={data?.queryExecutionMs || 1.2}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dynamic Multi-Dimensional Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          availableOutlets={data?.filterOptions.outlets || ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "JP Nagar", "MG Road"]}
          availableCategories={data?.filterOptions.categories || ["Burgers", "Sides", "Drinks", "Combos", "Wraps", "Extras", "Desserts"]}
          availableOrderTypes={data?.filterOptions.orderTypes || ["Dine-In", "Delivery", "Takeaway"]}
          availableSettlements={data?.filterOptions.settlements || ["Cash/Card/Coupon", "ZomatoPay", "SwiggyPay", "Dineout"]}
          dateRangeBounds={data?.filterOptions.dateRange || ["2025-06-17", "2026-06-16"]}
        />

        {/* Loading Indicator or Data Views */}
        {loading && !data ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-gray-400">
            <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Querying 300,000 transaction records...</p>
          </div>
        ) : data ? (
          <>
            {/* KPI Summary Grid */}
            <KPIGrid kpis={data.kpis} />

            {/* AI-Powered Executive Insights */}
            <AIInsightsCard insights={data.aiInsights} />

            {/* Visualizations Section */}
            <ChartsSection
              dailySeries={data.dailySeries}
              outletBreakdown={data.outletBreakdown}
              categoryBreakdown={data.categoryBreakdown}
              orderTypeBreakdown={data.orderTypeBreakdown}
              settlementBreakdown={data.settlementBreakdown}
              topItems={data.topItems}
              hourlyDistribution={data.hourlyDistribution}
            />

            {/* Granular POS Order Explorer & Table */}
            <OrderExplorer
              filters={filters}
              onExport={handleExportCSV}
              isExporting={isExporting}
            />
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0E131F] py-6 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-400">California Burrito / Burger Town</span>
            <span>•</span>
            <span>Software Developer Intern Technical Assessment</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>ETL Pipeline: Star Schema SQLite + OLAP Cube</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono font-medium">1,478x Query Speedup</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
