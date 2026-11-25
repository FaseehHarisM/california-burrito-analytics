import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 360);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        className={`flex-1 flex flex-col min-h-screen min-w-0 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
        style={{ transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
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
        <main
          className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto min-w-0"
          style={{ backgroundColor: '#FAF8F0' }}
        >
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
              <span style={{ color: 'rgba(245,240,220,0.78)' }}>Business Analytics Dashboard</span>
            </div>
            <div className="flex items-center space-x-3" style={{ color: 'rgba(245,240,220,0.68)' }}>
              <span>6 Bangalore Outlets</span>
              <span>•</span>
              <span>Jun 2025 – Jun 2026</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Convenient Floating Back-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full shadow-lg animate-scale-in transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: '#1B4332',
            color: '#F5F0DC',
            border: '2px solid #F5F0DC',
          }}
          title="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
