import React from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface TopNavProps {
  activeTab: ActiveTab;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
  isBackendHealthy: boolean;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'At-a-glance sales, orders, and popular items across your stores',
  },
  sales: {
    title: 'Sales Trends',
    subtitle: 'Track daily, weekly, and monthly revenue across stores and busy hours',
  },
  products: {
    title: 'Menu & Items',
    subtitle: 'See top sellers, category breakdown, and individual menu item performance',
  },
  outlets: {
    title: 'Store Performance',
    subtitle: 'Compare store sales, average order sizes, and busy hours across Bangalore',
  },
  orders: {
    title: 'Orders & Receipts',
    subtitle: 'Browse customer orders and click any order to view the itemized receipt',
  },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onRefresh,
  onExport,
  isLoading,
  isBackendHealthy,
}) => {
  const current = TAB_TITLES[activeTab];

  return (
    <header
      className="h-16 px-6 flex items-center justify-between sticky top-0 z-30"
      style={{
        backgroundColor: '#E8231A',
        borderBottom: '2px solid #C41D14',
        boxShadow: '0 2px 8px rgba(232, 35, 26, 0.25)',
      }}
    >
      {/* Title & Breadcrumb */}
      <div className="min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium" style={{ color: 'rgba(245,240,220,0.72)' }}>
            Dashboard
          </span>
          <span style={{ color: 'rgba(245,240,220,0.45)' }}>/</span>
          <h2 className="text-sm font-bold tracking-tight truncate" style={{ color: '#F5F0DC' }}>
            {current.title}
          </h2>
        </div>
        <p className="text-xs hidden sm:block truncate" style={{ color: 'rgba(245,240,220,0.75)' }}>
          {current.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5 shrink-0">
        {/* Simple Status Indicator only if loading or offline */}
        {!isBackendHealthy && (
          <div
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: 'rgba(245,240,220,0.18)',
              border: '1px solid rgba(245,240,220,0.35)',
              color: '#F5F0DC',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
            <span>Reconnecting...</span>
          </div>
        )}

        {/* Export CSV Button */}
        <button
          onClick={onExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          style={{
            backgroundColor: 'rgba(245,240,220,0.16)',
            border: '1px solid rgba(245,240,220,0.32)',
            color: '#F5F0DC',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.26)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.16)')}
          title="Download orders as CSV spreadsheet"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Download CSV</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: 'rgba(245,240,220,0.16)',
            border: '1px solid rgba(245,240,220,0.32)',
            color: '#F5F0DC',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.26)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.16)')}
          title="Refresh dashboard"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
};
