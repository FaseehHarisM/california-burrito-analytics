import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  UtensilsCrossed,
  Store,
  ReceiptText,
  ChevronLeft,
  CalendarRange,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'sales' | 'products' | 'outlets' | 'orders';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'overview', label: 'Overview',          icon: LayoutDashboard },
  { id: 'sales',    label: 'Sales Trends',      icon: TrendingUp      },
  { id: 'products', label: 'Menu & Items',      icon: UtensilsCrossed },
  { id: 'outlets',  label: 'Store Performance', icon: Store           },
  { id: 'orders',   label: 'Orders & Receipts', icon: ReceiptText     },
];

const ITEM_HEIGHT = 40; // px
const ITEM_GAP = 6;     // px
const STEP_HEIGHT = ITEM_HEIGHT + ITEM_GAP; // 46px

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const activeIndex = Math.max(0, NAV_ITEMS.findIndex((item) => item.id === activeTab));

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen flex flex-col justify-between select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        backgroundColor: '#1B4332',
        borderRight: '1px solid #2D6A4F',
        transition: 'width 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* ── Official Brand Logo Header ─────────────────────────────── */}
      <div>
        <div
          className={`h-16 flex items-center transition-all duration-300 ${
            isCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
          }`}
          style={{ borderBottom: '1px solid rgba(245,240,220,0.14)' }}
        >
          <div
            className={`flex items-center overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'justify-center w-full' : 'space-x-2.5'
            }`}
          >
            <img
              src="/cb-logo.png"
              alt="California Burrito"
              className={`object-contain shrink-0 drop-shadow-sm transition-all duration-300 hover:scale-105 ${
                isCollapsed ? 'h-8 w-auto' : 'h-11 w-auto'
              }`}
            />
            <div
              className="truncate transition-all duration-300"
              style={{
                maxWidth: isCollapsed ? '0px' : '140px',
                opacity: isCollapsed ? 0 : 1,
                transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0px)',
              }}
            >
              <p className="text-xs font-bold leading-tight truncate" style={{ color: '#F5F0DC' }}>
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

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer shrink-0"
              style={{ color: 'rgba(245,240,220,0.65)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
            </button>
          )}
        </div>

        {/* ── Navigation Items with Spring Sliding Active Pill ─────────── */}
        <nav className="p-2.5 mt-2">
          <div className="relative flex flex-col" style={{ gap: `${ITEM_GAP}px` }}>
            {/* Sliding Red Active Indicator */}
            <div
              className="absolute left-0 right-0 rounded-xl pointer-events-none flex items-center"
              style={{
                height: `${ITEM_HEIGHT}px`,
                transform: `translateY(${activeIndex * STEP_HEIGHT}px)`,
                background: 'linear-gradient(90deg, #E8231A 0%, #D31D15 100%)',
                boxShadow: '0 4px 12px rgba(232, 35, 26, 0.36)',
                transition: 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />

            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isAct = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`group relative z-10 w-full flex items-center rounded-xl text-xs font-medium cursor-pointer transition-colors duration-200 ${
                    isCollapsed ? 'justify-center px-2' : 'px-3 space-x-3'
                  }`}
                  style={{
                    height: `${ITEM_HEIGHT}px`,
                    color: isAct ? '#F5F0DC' : 'rgba(245,240,220,0.82)',
                    animationDelay: `${idx * 35}ms`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isAct) e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.10)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isAct) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isAct ? 'scale-105' : 'group-hover:scale-110 group-hover:translate-x-0.5'
                    }`}
                    style={{ color: isAct ? '#F5F0DC' : 'rgba(245,240,220,0.68)' }}
                  />

                  <span
                    className={`truncate text-left transition-all duration-300 ${
                      isCollapsed ? 'w-0 opacity-0 -translate-x-2 overflow-hidden !ml-0' : 'flex-1 opacity-100 translate-x-0'
                    }`}
                  >
                    {item.label}
                  </span>

                  {!isCollapsed && (
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: '#F5F0DC',
                        opacity: isAct ? 1 : 0,
                        transform: isAct ? 'scale(1)' : 'scale(0)',
                      }}
                    />
                  )}

                  {/* Smooth Hover Tooltip when Collapsed */}
                  {isCollapsed && (
                    <span
                      className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-lg z-50"
                      style={{
                        backgroundColor: '#1B4332',
                        color: '#F5F0DC',
                        border: '1px solid rgba(245,240,220,0.22)',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Clean Footer Store Summary & Expand Toggle ─────────── */}
      <div className="p-3 space-y-2" style={{ borderTop: '1px solid rgba(245,240,220,0.14)' }}>
        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            maxHeight: isCollapsed ? '0px' : '110px',
            opacity: isCollapsed ? 0 : 1,
            transform: isCollapsed ? 'translateY(6px)' : 'translateY(0px)',
          }}
        >
          <div
            className="p-3 rounded-xl text-[11px] space-y-1.5"
            style={{
              backgroundColor: 'rgba(245,240,220,0.08)',
              border: '1px solid rgba(245,240,220,0.14)',
            }}
          >
            <div className="flex items-center space-x-1.5 font-semibold" style={{ color: '#F5F0DC' }}>
              <CalendarRange className="h-3.5 w-3.5 shrink-0" style={{ color: '#E8231A' }} />
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
        </div>

        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 flex justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer"
            style={{ color: 'rgba(245,240,220,0.75)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(245,240,220,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Expand sidebar"
          >
            <ChevronLeft className="h-4 w-4 rotate-180 transition-transform duration-300" />
          </button>
        )}
      </div>
    </aside>
  );
};
