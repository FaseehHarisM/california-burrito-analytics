import React, { useState } from 'react';
import { 
  Calendar, 
  Store, 
  Utensils, 
  ShoppingBag, 
  CreditCard, 
  RotateCcw, 
  Check, 
  Filter as FilterIcon 
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
    { id: 'all', label: 'All Time (1 Yr)' },
    { id: 'last90', label: 'Last 90 Days' },
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'q4', label: 'Q4 Festive Season' },
    { id: 'custom', label: 'Custom Dates' },
  ];

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    if (!options) return;
    const [minD, maxD] = options.date_range;

    if (id === 'all') {
      setCustomRange(false);
      onApply({ startDate: minD, endDate: maxD });
    } else if (id === 'last90') {
      setCustomRange(false);
      onApply({ startDate: '2026-03-18', endDate: maxD });
    } else if (id === 'last30') {
      setCustomRange(false);
      onApply({ startDate: '2026-05-17', endDate: maxD });
    } else if (id === 'q4') {
      setCustomRange(false);
      onApply({ startDate: '2025-10-01', endDate: '2025-12-31' });
    } else if (id === 'custom') {
      setCustomRange(true);
    }
  };

  const activeFiltersCount = 
    (filters.outlet ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.orderType ? 1 : 0) +
    (filters.settlement ? 1 : 0) +
    (options && (filters.startDate !== options.date_range[0] || filters.endDate !== options.date_range[1]) ? 1 : 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs space-y-3">
      {/* Top row: Timeline presets & Quick reset */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium flex items-center space-x-1 mr-1">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>Timeline:</span>
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activePreset === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
              {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
          <button
            onClick={() => {
              setActivePreset('all');
              setCustomRange(false);
              onReset();
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {customRange && options && (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">From:</span>
          <input
            type="date"
            value={filters.startDate || options.date_range[0]}
            min={options.date_range[0]}
            max={filters.endDate || options.date_range[1]}
            onChange={(e) => onApply({ startDate: e.target.value })}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-500 font-medium">To:</span>
          <input
            type="date"
            value={filters.endDate || options.date_range[1]}
            min={filters.startDate || options.date_range[0]}
            max={options.date_range[1]}
            onChange={(e) => onApply({ endDate: e.target.value })}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Dimension Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100 text-xs">
        {/* Outlet Filter */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
          <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.outlet || ''}
            onChange={(e) => onApply({ outlet: e.target.value || undefined })}
            className="bg-transparent w-full text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Outlets (6)</option>
            {options?.outlets.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
          <Utensils className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.category || ''}
            onChange={(e) => onApply({ category: e.target.value || undefined })}
            className="bg-transparent w-full text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Categories (7)</option>
            {options?.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Order Type Filter */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.orderType || ''}
            onChange={(e) => onApply({ orderType: e.target.value || undefined })}
            className="bg-transparent w-full text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Fulfillment Types</option>
            {options?.order_types.map((ot) => (
              <option key={ot} value={ot}>{ot}</option>
            ))}
          </select>
        </div>

        {/* Payment Filter */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
          <CreditCard className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.settlement || ''}
            onChange={(e) => onApply({ settlement: e.target.value || undefined })}
            className="bg-transparent w-full text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Payment Channels</option>
            {options?.settlements.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
