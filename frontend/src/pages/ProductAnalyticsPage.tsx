import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { UtensilsCrossed, Search, ArrowUpDown, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { FilterState, ProductPerformanceItem } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface ProductAnalyticsPageProps {
  filters: FilterState;
}

export const ProductAnalyticsPage: React.FC<ProductAnalyticsPageProps> = ({ filters }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof ProductPerformanceItem>('total_revenue');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getProductAnalytics(filters, search)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => console.error('Failed to load product analytics:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters, search]);

  const handleSort = (field: keyof ProductPerformanceItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedProducts = [...(data?.products || [])].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 2-Column: Top 5 & Lowest 5 Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best-Selling */}
        <div className="bi-card p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Top 5 Volume Drivers
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            {data?.top_selling_products?.map((p: any, idx: number) => (
              <div key={p.product} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="font-bold text-slate-400 w-4">#{idx + 1}</span>
                  <div>
                    <h5 className="font-semibold text-slate-900 truncate max-w-[200px]">{p.product}</h5>
                    <span className="text-[11px] text-slate-500">{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatCompactCurrency(p.total_revenue)}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{formatNumber(p.quantity_sold)} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest 5 Selling (Underperforming) */}
        <div className="bi-card p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Lowest 5 Volume Items
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            {data?.lowest_selling_products?.map((p: any, idx: number) => (
              <div key={p.product} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="font-bold text-slate-400 w-4">#{idx + 1}</span>
                  <div>
                    <h5 className="font-semibold text-slate-900 truncate max-w-[200px]">{p.product}</h5>
                    <span className="text-[11px] text-slate-500">{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatCompactCurrency(p.total_revenue)}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{formatNumber(p.quantity_sold)} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Searchable & Sortable Product Catalog Table */}
      <div className="bi-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Complete Menu Product Performance Catalog ({sortedProducts.length} Items)
            </h3>
            <p className="text-xs text-slate-500">Sort by revenue, volume, average selling price (ASP), and share</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search product or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 sm:w-64 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold select-none">
              <tr>
                <th className="py-2.5 px-4 cursor-pointer" onClick={() => handleSort('rank')}>
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer" onClick={() => handleSort('product')}>
                  <div className="flex items-center space-x-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer" onClick={() => handleSort('category')}>
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer" onClick={() => handleSort('quantity_sold')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Units Sold</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer" onClick={() => handleSort('total_revenue')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Revenue</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer" onClick={() => handleSort('avg_selling_price')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>ASP (Avg Price)</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer" onClick={() => handleSort('revenue_contribution_pct')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Contribution %</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading product data...</td>
                </tr>
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No products match your search.</td>
                </tr>
              ) : (
                sortedProducts.map((p) => (
                  <tr key={p.product} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-400">#{p.rank}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{p.product}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">{formatNumber(p.quantity_sold)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(p.total_revenue)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">₹{p.avg_selling_price.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-600">{p.revenue_contribution_pct}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
