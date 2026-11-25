import React, { useState } from 'react';
import {
  Calendar,
  Store,
  Utensils,
  ShoppingBag,
  CreditCard,
  RotateCcw,
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

  const activeFiltersCount =
    (filters.outlet     ? 1 : 0) +
    (filters.category   ? 1 : 0) +
    (filters.orderType  ? 1 : 0) +
    (filters.settlement ? 1 : 0) +
    (options && (filters.startDate !== options.date_range[0] || filters.endDate !== options.date_range[1]) ? 1 : 0);

  const selectWrap: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FAF8F0',
    border: '1px solid #C8C2AA',
    borderRadius: '8px',
    padding: '7px 10px',
  };

  return (
    <div
      className="rounded-xl p-3.5 space-y-3"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #C8C2AA',
        boxShadow: '0 1px 3px rgba(27,67,50,0.06)',
      }}
    >
      {/* Top row: Date range presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span
            className="font-medium flex items-center space-x-1 mr-1"
            style={{ color: '#7A7260' }}
          >
            <Calendar className="h-3.5 w-3.5" style={{ color: '#1B4332' }} />
            <span>Date Range:</span>
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p.id)}
              className="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer"
              style={
                activePreset === p.id
                  ? { backgroundColor: '#1B4332', color: '#F5F0DC' }
                  : { backgroundColor: '#F3F0E6', color: '#5C5648' }
              }
              onMouseEnter={e => {
                if (activePreset !== p.id) e.currentTarget.style.backgroundColor = '#E5E0D0';
              }}
              onMouseLeave={e => {
                if (activePreset !== p.id) e.currentTarget.style.backgroundColor = '#F3F0E6';
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#EAF4EE', color: '#1B4332', border: '1px solid #2D6A4F' }}
            >
              {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
          <button
            onClick={() => { setActivePreset('all'); setCustomRange(false); onReset(); }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
            style={{ color: '#7A7260' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F0E6'; e.currentTarget.style.color = '#1B4332'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#7A7260'; }}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {customRange && options && (
        <div
          className="flex flex-wrap items-center gap-3 p-2.5 rounded-lg text-xs"
          style={{ backgroundColor: '#F3F0E6', border: '1px solid #C8C2AA' }}
        >
          <span className="font-medium" style={{ color: '#5C5648' }}>From:</span>
          <input
            type="date"
            value={filters.startDate || options.date_range[0]}
            min={options.date_range[0]}
            max={filters.endDate || options.date_range[1]}
            onChange={(e) => onApply({ startDate: e.target.value })}
            className="bg-white rounded px-2 py-1 focus:outline-none"
            style={{ border: '1px solid #C8C2AA', color: '#1B4332' }}
          />
          <span className="font-medium" style={{ color: '#5C5648' }}>To:</span>
          <input
            type="date"
            value={filters.endDate || options.date_range[1]}
            min={filters.startDate || options.date_range[0]}
            max={options.date_range[1]}
            onChange={(e) => onApply({ endDate: e.target.value })}
            className="bg-white rounded px-2 py-1 focus:outline-none"
            style={{ border: '1px solid #C8C2AA', color: '#1B4332' }}
          />
        </div>
      )}

      {/* Dropdowns */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 text-xs"
        style={{ borderTop: '1px solid #E5E0D0' }}
      >
        {/* Store */}
        <div style={selectWrap}>
          <Store className="h-3.5 w-3.5 shrink-0" style={{ color: '#2D6A4F' }} />
          <select
            value={filters.outlet || ''}
            onChange={(e) => onApply({ outlet: e.target.value || undefined })}
            className="bg-transparent w-full font-medium focus:outline-none cursor-pointer"
            style={{ color: '#1B4332' }}
          >
            <option value="">All Stores (6)</option>
            {options?.outlets.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Category */}
        <div style={selectWrap}>
          <Utensils className="h-3.5 w-3.5 shrink-0" style={{ color: '#2D6A4F' }} />
          <select
            value={filters.category || ''}
            onChange={(e) => onApply({ category: e.target.value || undefined })}
            className="bg-transparent w-full font-medium focus:outline-none cursor-pointer"
            style={{ color: '#1B4332' }}
          >
            <option value="">All Categories (7)</option>
            {options?.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Order Type */}
        <div style={selectWrap}>
          <ShoppingBag className="h-3.5 w-3.5 shrink-0" style={{ color: '#2D6A4F' }} />
          <select
            value={filters.orderType || ''}
            onChange={(e) => onApply({ orderType: e.target.value || undefined })}
            className="bg-transparent w-full font-medium focus:outline-none cursor-pointer"
            style={{ color: '#1B4332' }}
          >
            <option value="">All Order Types</option>
            {options?.order_types.map((ot) => <option key={ot} value={ot}>{ot}</option>)}
          </select>
        </div>

        {/* Payment */}
        <div style={selectWrap}>
          <CreditCard className="h-3.5 w-3.5 shrink-0" style={{ color: '#2D6A4F' }} />
          <select
            value={filters.settlement || ''}
            onChange={(e) => onApply({ settlement: e.target.value || undefined })}
            className="bg-transparent w-full font-medium focus:outline-none cursor-pointer"
            style={{ color: '#1B4332' }}
          >
            <option value="">All Payment Methods</option>
            {options?.settlements.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};
