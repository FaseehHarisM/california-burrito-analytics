import React, { useState } from 'react';
import {
  Calendar,
  Store,
  Utensils,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  X,
} from 'lucide-react';
import { FilterState, FilterOptions } from '../types';

interface FilterBarProps {
  filters: FilterState;
  options: FilterOptions | null;
  onApply: (updated: Partial<FilterState>) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  options,
  onApply,
  onReset,
}) => {
  const [activePreset, setActivePreset] = useState<string>('all');
  const [customRange, setCustomRange] = useState(false);

  const presets = [
    { id: 'all',    label: 'All Time'       },
    { id: 'last90', label: 'Last 90 Days'   },
    { id: 'last30', label: 'Last 30 Days'   },
    { id: 'q4',     label: 'Oct – Dec Peak' },
    { id: 'custom', label: 'Custom Dates'   },
  ];

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    if (!options) return;
    const [minD, maxD] = options.date_range;
    if      (id === 'all')    { setCustomRange(false); onApply({ startDate: minD, endDate: maxD }); }
    else if (id === 'last90') { setCustomRange(false); onApply({ startDate: '2026-03-18', endDate: maxD }); }
    else if (id === 'last30') { setCustomRange(false); onApply({ startDate: '2026-05-17', endDate: maxD }); }
    else if (id === 'q4')     { setCustomRange(false); onApply({ startDate: '2025-10-01', endDate: '2025-12-31' }); }
    else if (id === 'custom') { setCustomRange(true); }
  };

  const isDateModified = Boolean(
    options && (filters.startDate !== options.date_range[0] || filters.endDate !== options.date_range[1])
  );

  const activeChips: { label: string; onClear: () => void }[] = [];
  if (isDateModified && options) {
    activeChips.push({
      label: `Dates: ${filters.startDate} to ${filters.endDate}`,
      onClear: () => {
        setActivePreset('all');
        setCustomRange(false);
        onApply({ startDate: options.date_range[0], endDate: options.date_range[1] });
      },
    });
  }
  if (filters.outlet) {
    activeChips.push({ label: `Store: ${filters.outlet}`, onClear: () => onApply({ outlet: undefined }) });
  }
  if (filters.category) {
    activeChips.push({ label: `Category: ${filters.category}`, onClear: () => onApply({ category: undefined }) });
  }
  if (filters.orderType) {
    activeChips.push({ label: `Order Type: ${filters.orderType}`, onClear: () => onApply({ orderType: undefined }) });
  }
  if (filters.settlement) {
    activeChips.push({ label: `Payment: ${filters.settlement}`, onClear: () => onApply({ settlement: undefined }) });
  }

  return (
    <div className="bi-card p-3.5 space-y-3">
      {/* Top row: Date range presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span
            className="font-semibold flex items-center space-x-1.5 mr-1"
            style={{ color: '#5C5648' }}
          >
            <Calendar className="h-3.5 w-3.5" style={{ color: '#E8231A' }} />
            <span>Date Range:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: '#F3F0E6' }}>
            {presets.map((p) => {
              const active = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className="px-2.5 py-1 rounded-lg font-medium transition-all duration-200 active:scale-95 cursor-pointer"
                  style={
                    active
                      ? {
                          backgroundColor: '#1B4332',
                          color: '#F5F0DC',
                          boxShadow: '0 2px 6px rgba(27,67,50,0.22)',
                        }
                      : { color: '#5C5648' }
                  }
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.backgroundColor = 'rgba(27,67,50,0.08)';
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeChips.length > 0 && (
            <span
              className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold animate-scale-in"
              style={{ backgroundColor: '#EAF4EE', color: '#1B4332', border: '1px solid rgba(27,67,50,0.22)' }}
            >
              {activeChips.length} active
            </span>
          )}
          <button
            onClick={() => {
              setActivePreset('all');
              setCustomRange(false);
              onReset();
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
            style={{ color: '#5C5648', backgroundColor: '#FAF8F0', border: '1px solid #E2DCC8' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#F3F0E6';
              e.currentTarget.style.color = '#1B4332';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FAF8F0';
              e.currentTarget.style.color = '#5C5648';
            }}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {customRange && options && (
        <div
          className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl text-xs animate-slide-down"
          style={{ backgroundColor: '#FAF8F0', border: '1px solid #C8C2AA' }}
        >
          <span className="font-semibold" style={{ color: '#1B4332' }}>From:</span>
          <input
            type="date"
            value={filters.startDate || options.date_range[0]}
            min={options.date_range[0]}
            max={filters.endDate || options.date_range[1]}
            onChange={(e) => onApply({ startDate: e.target.value })}
            className="bg-white rounded-lg px-2.5 py-1 focus:outline-none transition-colors"
            style={{ border: '1px solid #C8C2AA', color: '#1B4332' }}
          />
          <span className="font-semibold" style={{ color: '#1B4332' }}>To:</span>
          <input
            type="date"
            value={filters.endDate || options.date_range[1]}
            min={filters.startDate || options.date_range[0]}
            max={options.date_range[1]}
            onChange={(e) => onApply({ endDate: e.target.value })}
            className="bg-white rounded-lg px-2.5 py-1 focus:outline-none transition-colors"
            style={{ border: '1px solid #C8C2AA', color: '#1B4332' }}
          />
        </div>
      )}

      {/* Dimension Dropdowns */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2.5 text-xs"
        style={{ borderTop: '1px solid #EDE8D8' }}
      >
        {[
          {
            icon: Store,
            val: filters.outlet || '',
            placeholder: 'All Stores (6)',
            list: options?.outlets || [],
            active: Boolean(filters.outlet),
            onChange: (v: string) => onApply({ outlet: v || undefined }),
          },
          {
            icon: Utensils,
            val: filters.category || '',
            placeholder: 'All Categories (7)',
            list: options?.categories || [],
            active: Boolean(filters.category),
            onChange: (v: string) => onApply({ category: v || undefined }),
          },
          {
            icon: ShoppingBag,
            val: filters.orderType || '',
            placeholder: 'All Order Types',
            list: options?.order_types || [],
            active: Boolean(filters.orderType),
            onChange: (v: string) => onApply({ orderType: v || undefined }),
          },
          {
            icon: CreditCard,
            val: filters.settlement || '',
            placeholder: 'All Payment Methods',
            list: options?.settlements || [],
            active: Boolean(filters.settlement),
            onChange: (v: string) => onApply({ settlement: v || undefined }),
          },
        ].map((ctrl, idx) => {
          const Icon = ctrl.icon;
          return (
            <div
              key={idx}
              className="flex items-center space-x-2 rounded-xl px-3 py-2 transition-all duration-200 focus-within:ring-2"
              style={{
                backgroundColor: ctrl.active ? '#EAF4EE' : '#FAF8F0',
                border: ctrl.active ? '1px solid #2D6A4F' : '1px solid #D8D1BD',
              }}
            >
              <Icon
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: ctrl.active ? '#E8231A' : '#2D6A4F' }}
              />
              <select
                value={ctrl.val}
                onChange={(e) => ctrl.onChange(e.target.value)}
                className="bg-transparent w-full font-medium focus:outline-none cursor-pointer"
                style={{ color: '#1B4332' }}
              >
                <option value="">{ctrl.placeholder}</option>
                {ctrl.list.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Removable Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 animate-slide-down text-[11px]">
          <span className="font-medium mr-1" style={{ color: '#7A7260' }}>Showing:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              onClick={chip.onClear}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-medium transition-all duration-150 hover:opacity-85 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: '#FDF0EF',
                color: '#E8231A',
                border: '1px solid rgba(232,35,26,0.22)',
              }}
              title="Click to remove filter"
            >
              <span>{chip.label}</span>
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
