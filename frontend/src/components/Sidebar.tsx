import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  UtensilsCrossed, 
  Store, 
  ReceiptText, 
  ChevronLeft, 
  ChevronRight,
  Database,
  BarChart3,
  Cpu
} from 'lucide-react';

export type ActiveTab = 'overview' | 'sales' | 'products' | 'outlets' | 'orders';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenArchModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onOpenArchModal,
}) => {
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'sales' as ActiveTab, label: 'Sales Analytics', icon: TrendingUp },
    { id: 'products' as ActiveTab, label: 'Product Analytics', icon: UtensilsCrossed },
    { id: 'outlets' as ActiveTab, label: 'Outlet Performance', icon: Store },
    { id: 'orders' as ActiveTab, label: 'Orders & Transactions', icon: ReceiptText },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r border-slate-200/90 flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="truncate">
                <h1 className="font-semibold text-sm text-slate-900 tracking-tight leading-tight">
                  Burger Town
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">California Burrito BI</p>
              </div>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm mx-auto shadow-sm">
              <BarChart3 className="h-4 w-4" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ${
              isCollapsed ? 'hidden' : 'block'
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center rounded-lg text-xs font-medium transition-all ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 space-x-3'
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Architecture Docs */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={onOpenArchModal}
          className={`w-full flex items-center rounded-lg text-xs font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all ${
            isCollapsed ? 'justify-center p-2' : 'px-3 py-2 space-x-2'
          }`}
          title="Architecture Decisions & Benchmarks"
        >
          <Cpu className="h-4 w-4 text-orange-500 shrink-0" />
          {!isCollapsed && <span>Architecture & Docs</span>}
        </button>

        {!isCollapsed && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center space-x-1 font-semibold text-slate-700">
              <Database className="h-3 w-3 text-blue-500" />
              <span>300K POS Records</span>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>FastAPI + SQLite</span>
              <span className="font-mono">v1.0.0</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-200/50">
              Technical Assessment
            </div>
          </div>
        )}

        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 flex justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
