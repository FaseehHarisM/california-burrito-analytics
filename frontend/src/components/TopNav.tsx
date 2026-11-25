import React from 'react';
import { 
  RefreshCw, 
  Download, 
  ExternalLink, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface TopNavProps {
  activeTab: ActiveTab;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
  processTimeMs?: string;
  isBackendHealthy: boolean;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Executive Overview',
    subtitle: 'High-level POS summary metrics, velocity trends, and channel distributions',
  },
  sales: {
    title: 'Sales & Revenue Analytics',
    subtitle: 'Daily, weekly, and monthly sales trends with multi-outlet velocity comparisons',
  },
  products: {
    title: 'Menu & Product Intelligence',
    subtitle: 'Volume rankings, menu group margins, and product catalog performance',
  },
  outlets: {
    title: 'Outlet Network Performance',
    subtitle: 'Comparative throughput, basket metrics, and store drilldowns across Bangalore',
  },
  orders: {
    title: 'Orders & Transaction Explorer',
    subtitle: 'Order-level line items audit log, server-side pagination, and bill inspection',
  },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onRefresh,
  onExport,
  isLoading,
  processTimeMs,
  isBackendHealthy,
}) => {
  const current = TAB_TITLES[activeTab];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Breadcrumb */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-400">Dashboard</span>
          <span className="text-xs text-slate-300">/</span>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            {current.title}
          </h2>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          {current.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Backend Status Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200/60">
          <span className={`h-1.5 w-1.5 rounded-full ${isBackendHealthy ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
          <span>{isBackendHealthy ? 'FastAPI Connected' : 'Connecting...'}</span>
          {processTimeMs && (
            <span className="text-slate-400 font-mono text-[10px] ml-1">
              ({processTimeMs}ms)
            </span>
          )}
        </div>

        {/* Export CSV Button */}
        <button
          onClick={onExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-xs"
          title="Export Filtered Orders as CSV"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 shadow-xs"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>
    </header>
  );
};
