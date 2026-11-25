import React, { useState } from 'react';
import { Sidebar, ActiveTab } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { FilterBar } from '../components/FilterBar';
import { FilterState, FilterOptions } from '../types';

interface DashboardLayoutProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  filters: FilterState;
  filterOptions: FilterOptions | null;
  onApplyFilters: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
  isBackendHealthy: boolean;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  filters,
  filterOptions,
  onApplyFilters,
  onResetFilters,
  onRefresh,
  onExport,
  isLoading,
  isBackendHealthy,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAF8F0' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Navigation */}
        <TopNav
          activeTab={activeTab}
          onRefresh={onRefresh}
          onExport={onExport}
          isLoading={isLoading}
          isBackendHealthy={isBackendHealthy}
        />

        {/* Page Container */}
        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto min-w-0" style={{ backgroundColor: '#FAF8F0' }}>
          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            options={filterOptions}
            onApply={onApplyFilters}
            onReset={onResetFilters}
          />

          {/* Active Page View */}
          {children}
        </main>

        {/* Clean General Brand Footer */}
        <footer className="py-4 px-6 text-xs" style={{ borderTop: '1px solid #E5E0D0', backgroundColor: '#1B4332' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div style={{ color: '#F5F0DC' }}>
              <span className="font-bold">California Burrito</span>
              <span className="mx-2" style={{ color: 'rgba(245,240,220,0.4)' }}>•</span>
              <span style={{ color: 'rgba(245,240,220,0.75)' }}>Business Analytics Dashboard</span>
            </div>
            <div className="flex items-center space-x-3" style={{ color: 'rgba(245,240,220,0.65)' }}>
              <span>6 Bangalore Outlets</span>
              <span>•</span>
              <span>Jun 2025 – Jun 2026</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
