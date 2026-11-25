"use client";

import React, { useState } from "react";
import { Filter, Calendar, RotateCcw, ChevronDown, Check, Store, Utensils, CreditCard, ShoppingBag } from "lucide-react";
import { FilterState } from "@/types/analytics";

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  availableOutlets: string[];
  availableCategories: string[];
  availableOrderTypes: string[];
  availableSettlements: string[];
  dateRangeBounds: [string, string];
}

export default function FilterBar({
  filters,
  onChange,
  onReset,
  availableOutlets,
  availableCategories,
  availableOrderTypes,
  availableSettlements,
  dateRangeBounds,
}: FilterBarProps) {
  const [activePreset, setActivePreset] = useState<string>("all");
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);

  const handlePresetChange = (preset: string) => {
    setActivePreset(preset);
    const [minD, maxD] = dateRangeBounds;

    if (preset === "all") {
      setIsCustomDate(false);
      onChange({ startDate: minD, endDate: maxD });
    } else if (preset === "last90") {
      setIsCustomDate(false);
      onChange({ startDate: "2026-03-18", endDate: maxD });
    } else if (preset === "last30") {
      setIsCustomDate(false);
      onChange({ startDate: "2026-05-17", endDate: maxD });
    } else if (preset === "q4") {
      setIsCustomDate(false);
      onChange({ startDate: "2025-10-01", endDate: "2025-12-31" });
    } else if (preset === "custom") {
      setIsCustomDate(true);
    }
  };

  const toggleOutlet = (outlet: string) => {
    const current = new Set(filters.outlets);
    if (current.has(outlet)) {
      current.delete(outlet);
    } else {
      current.add(outlet);
    }
    onChange({ outlets: Array.from(current) });
  };

  const toggleCategory = (cat: string) => {
    const current = new Set(filters.categories);
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    onChange({ categories: Array.from(current) });
  };

  const toggleOrderType = (type: string) => {
    const current = new Set(filters.orderTypes);
    if (current.has(type)) {
      current.delete(type);
    } else {
      current.add(type);
    }
    onChange({ orderTypes: Array.from(current) });
  };

  const activeFilterCount =
    (filters.outlets.length > 0 ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.orderTypes.length > 0 ? 1 : 0) +
    (filters.settlements.length > 0 ? 1 : 0) +
    (filters.startDate !== dateRangeBounds[0] || filters.endDate !== dateRangeBounds[1] ? 1 : 0);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Top Filter Bar: Date Presets & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800 text-xs">
          <span className="px-2 text-gray-400 flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-orange-400" />
            <span className="font-medium">Timeline:</span>
          </span>
          {[
            { id: "all", label: "All Time (1 Yr)" },
            { id: "last90", label: "Last 90 Days" },
            { id: "last30", label: "Last 30 Days" },
            { id: "q4", label: "Q4 Festive Season" },
            { id: "custom", label: "Custom Dates" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetChange(p.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === p.id
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Reset & Status */}
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
              {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}
            </span>
          )}
          <button
            onClick={() => {
              setActivePreset("all");
              setIsCustomDate(false);
              onReset();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers (Shown if Custom selected) */}
      {isCustomDate && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs">
          <span className="text-gray-400 font-medium">From:</span>
          <input
            type="date"
            value={filters.startDate}
            min={dateRangeBounds[0]}
            max={filters.endDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-orange-500"
          />
          <span className="text-gray-400 font-medium">To:</span>
          <input
            type="date"
            value={filters.endDate}
            min={filters.startDate}
            max={dateRangeBounds[1]}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-orange-500"
          />
        </div>
      )}

      {/* Filter Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {/* Outlets Multi-Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 flex items-center space-x-1.5 uppercase tracking-wider">
            <Store className="h-3.5 w-3.5 text-blue-400" />
            <span>Outlets ({filters.outlets.length === 0 ? "All 6" : filters.outlets.length})</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {availableOutlets.map((outlet) => {
              const isSelected = filters.outlets.includes(outlet);
              return (
                <button
                  key={outlet}
                  onClick={() => toggleOutlet(outlet)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500 text-blue-300 font-medium"
                      : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                  }`}
                >
                  {outlet}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Multi-Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 flex items-center space-x-1.5 uppercase tracking-wider">
            <Utensils className="h-3.5 w-3.5 text-amber-400" />
            <span>Categories ({filters.categories.length === 0 ? "All 7" : filters.categories.length})</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {availableCategories.map((cat) => {
              const isSelected = filters.categories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-amber-600/20 border-amber-500 text-amber-300 font-medium"
                      : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Types */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 flex items-center space-x-1.5 uppercase tracking-wider">
            <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
            <span>Fulfillment Type</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {availableOrderTypes.map((ot) => {
              const isSelected = filters.orderTypes.includes(ot);
              return (
                <button
                  key={ot}
                  onClick={() => toggleOrderType(ot)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-medium"
                      : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                  }`}
                >
                  {ot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settlement Payment Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 flex items-center space-x-1.5 uppercase tracking-wider">
            <CreditCard className="h-3.5 w-3.5 text-purple-400" />
            <span>Payment Method</span>
          </label>
          <select
            value={filters.settlements[0] || ""}
            onChange={(e) =>
              onChange({
                settlements: e.target.value ? [e.target.value] : [],
              })
            }
            className="w-full bg-gray-900 border border-gray-800 text-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500"
          >
            <option value="">All Payment Gateways</option>
            {availableSettlements.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
