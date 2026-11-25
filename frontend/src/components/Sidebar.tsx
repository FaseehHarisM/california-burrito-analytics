import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  UtensilsCrossed,
  Store,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'sales' | 'products' | 'outlets' | 'orders';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview',          icon: LayoutDashboard },
    { id: 'sales'    as ActiveTab, label: 'Sales Trends',      icon: TrendingUp      },
    { id: 'products' as ActiveTab, label: 'Menu & Items',      icon: UtensilsCrossed },
    { id: 'outlets'  as ActiveTab, label: 'Store Performance', icon: Store           },
    { id: 'orders'   as ActiveTab, label: 'Orders & Receipts', icon: ReceiptText     },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen flex flex-col justify-between select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        backgroundColor: '#1B4332',
        borderRight: '1px solid #2D6A4F',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── Official Brand Logo Header ─────────────────────────────── */}
      <div>
        <div
          className={`h-16 flex items-center transition-all ${
            isCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
          }`}
          style={{ borderBottom: '1px solid rgba(245,240,220,0.14)' }}
        >
          {!isCollapsed ? (
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <img
                src="/cb-logo.png"
                alt="California Burrito"
                className="h-11 w-auto object-contain shrink-0 drop-shadow-sm transition-transform duration-300 hover:scale-105"
              />
              <div className="truncate">
                <p
                  className="text-xs font-bold leading-tight truncate"
                  style={{ color: '#F5F0DC' }}
                >
                  Store Insights
                </p>
                <p
                  className="text-[10px] font-medium mt-0.5 truncate"
                  style={{ color: 'rgba(245,240,220,0.70)' }}
                >
                  Sales & Menu Hub
                </p>
              </div>
            </div>
          ) : (
            <img
              src="/cb-logo.png"
              alt="California Burrito"
              className="w-11 h-auto object-contain mx-auto drop-shadow-sm"
              title="California Burrito Store Insights"
            />
          )}

          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg transition-all duration-200 active:scale-90 cursor-pointer ${
              isCollapsed ? 'hidden' : 'block'
            }`}
            style={{ color: 'rgba(245,240,220,0.65)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* ── Navigation Items ─────────────────────────── */}
        <nav className="p-2.5 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon  = item.icon;
            const isAct = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group w-full flex items-center rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 space-x-3'
                } ${!isAct ? 'hover:translate-x-0.5' : ''}`}
                style={
                  isAct
                    ? {
                        backgroundColor: '#E8231A',
                        color: '#F5F0DC',
                        boxShadow: '0 4px 12px rgba(232, 35, 26, 0.35)',
                      }
                    : { color: 'rgba(245,240,220,0.82)' }
                }
                onMouseEnter={e => {
                  if (!isAct) e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.10)';
                }}
                onMouseLeave={e => {
                  if (!isAct) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    !isAct ? 'group-hover:scale-110' : ''
                  }`}
                  style={{ color: isAct ? '#F5F0DC' : 'rgba(245,240,220,0.68)' }}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && isAct && (
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: '#F5F0DC' }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Clean Footer Store Summary ─────────── */}
      <div className="p-3 space-y-2" style={{ borderTop: '1px solid rgba(245,240,220,0.14)' }}>
        {!isCollapsed && (
          <div
            className="p-3 rounded-xl text-[11px] space-y-1.5 transition-colors duration-200"
            style={{
              backgroundColor: 'rgba(245,240,220,0.08)',
              border: '1px solid rgba(245,240,220,0.14)',
            }}
          >
            <div className="flex items-center space-x-1.5 font-semibold" style={{ color: '#F5F0DC' }}>
              <CalendarRange className="h-3.5 w-3.5" style={{ color: '#E8231A' }} />
              <span>Reporting Period</span>
            </div>
            <div className="text-[11px]" style={{ color: 'rgba(245,240,220,0.85)' }}>
              Jun 2025 – Jun 2026
            </div>
            <div
              className="text-[10px] pt-1 flex justify-between"
              style={{
                borderTop: '1px solid rgba(245,240,220,0.14)',
                color: 'rgba(245,240,220,0.60)',
              }}
            >
              <span>6 Stores • 45 Items</span>
              <span>v1.0</span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 flex justify-center rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
            style={{ color: 'rgba(245,240,220,0.65)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
