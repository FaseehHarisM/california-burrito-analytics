import React, { useState } from 'react';
import { Sidebar, ActiveTab } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { FilterBar } from '../components/FilterBar';
import { ArchitectureModal } from '../components/ArchitectureModal';
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
  processTimeMs?: string;
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
  processTimeMs,
  isBackendHealthy,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenArchModal={() => setIsArchModalOpen(true)}
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
          processTimeMs={processTimeMs}
          isBackendHealthy={isBackendHealthy}
        />

        {/* Page Container */}
        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto min-w-0">
          {/* Global Dynamic Filter Bar */}
          <FilterBar
            filters={filters}
            options={filterOptions}
            onApply={onApplyFilters}
            onReset={onResetFilters}
          />

          {/* Active Page View */}
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700">California Burrito / Burger Town</span>
              <span className="mx-2">•</span>
              <span>Software Developer Intern Technical Assessment</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <span>SQLite Star Schema + FastAPI</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">1,478x Query Speedup</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Architecture Decisions Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
};
