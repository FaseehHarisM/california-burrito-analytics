import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, TrendingUp, TrendingDown, X } from 'lucide-react';
import { FilterState, ProductPerformanceItem } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatNumber } from '../utils/formatters';

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

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bi-card p-5 h-72 shimmer-bg" />
          <div className="bi-card p-5 h-72 shimmer-bg" />
        </div>
        <div className="bi-card p-5 h-96 shimmer-bg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 2-Column: Top 5 & Lowest 5 Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bi-card bi-card-hover p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" style={{ color: '#2D6A4F' }} />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              Top 5 Best Sellers
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            {data?.top_selling_products?.map((p: any, idx: number) => (
              <div
                key={p.product}
                className="p-2.5 rounded-xl flex items-center justify-between transition-all duration-150 hover:translate-x-0.5"
                style={{ backgroundColor: '#FAF8F0', border: '1px solid #E5E0D0' }}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className="font-bold w-6 h-6 rounded-full flex items-center justify-center text-[11px]"
                    style={{ backgroundColor: '#EAF4EE', color: '#1B4332' }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="font-semibold truncate max-w-[200px]" style={{ color: '#1B4332' }}>{p.product}</h5>
                    <span className="text-[11px]" style={{ color: '#7A7260' }}>{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono" style={{ color: '#1B4332' }}>{formatCompactCurrency(p.total_revenue)}</div>
                  <div className="text-[10px] font-mono" style={{ color: '#7A7260' }}>{formatNumber(p.quantity_sold)} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bi-card bi-card-hover p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4" style={{ color: '#E8231A' }} />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              5 Lowest-Selling Items
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            {data?.lowest_selling_products?.map((p: any, idx: number) => (
              <div
                key={p.product}
                className="p-2.5 rounded-xl flex items-center justify-between transition-all duration-150 hover:translate-x-0.5"
                style={{ backgroundColor: '#FAF8F0', border: '1px solid #E5E0D0' }}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className="font-bold w-6 h-6 rounded-full flex items-center justify-center text-[11px]"
                    style={{ backgroundColor: '#FDF0EF', color: '#E8231A' }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="font-semibold truncate max-w-[200px]" style={{ color: '#1B4332' }}>{p.product}</h5>
                    <span className="text-[11px]" style={{ color: '#7A7260' }}>{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono" style={{ color: '#1B4332' }}>{formatCompactCurrency(p.total_revenue)}</div>
                  <div className="text-[10px] font-mono" style={{ color: '#7A7260' }}>{formatNumber(p.quantity_sold)} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Searchable & Sortable Menu Items Table */}
      <div className="bi-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              All Menu Items ({sortedProducts.length} Items)
            </h3>
            <p className="text-xs" style={{ color: '#7A7260' }}>
              Sort by sales, units sold, average price, or share of total sales
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search product or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 sm:w-64 rounded-xl pl-8 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: '#FAF8F0',
                border: '1px solid #C8C2AA',
                color: '#1B4332',
              }}
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5" style={{ color: '#7A7260' }} />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 p-0.5 rounded-full hover:bg-black/5 cursor-pointer"
                style={{ color: '#7A7260' }}
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #E5E0D0' }}>
          <table className="w-full text-left text-xs">
            <thead
              className="uppercase font-semibold select-none"
              style={{ backgroundColor: '#F3F0E6', color: '#1B4332', borderBottom: '1px solid #C8C2AA' }}
            >
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:opacity-80" onClick={() => handleSort('rank')}>
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:opacity-80" onClick={() => handleSort('product')}>
                  <div className="flex items-center space-x-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:opacity-80" onClick={() => handleSort('category')}>
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:opacity-80" onClick={() => handleSort('quantity_sold')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Units Sold</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:opacity-80" onClick={() => handleSort('total_revenue')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Sales</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:opacity-80" onClick={() => handleSort('avg_selling_price')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Avg Price</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:opacity-80" onClick={() => handleSort('revenue_contribution_pct')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Sales Share %</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center" style={{ color: '#7A7260' }}>Loading menu items...</td>
                </tr>
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center" style={{ color: '#7A7260' }}>No menu items match your search.</td>
                </tr>
              ) : (
                sortedProducts.map((p) => (
                  <tr key={p.product} className="hover:bg-cb-cream-bg/85 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium" style={{ color: '#9C9480' }}>#{p.rank}</td>
                    <td className="py-2.5 px-4 font-semibold" style={{ color: '#1B4332' }}>{p.product}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ backgroundColor: '#F3F0E6', color: '#5C5648', border: '1px solid #C8C2AA' }}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">{formatNumber(p.quantity_sold)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(p.total_revenue)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">₹{p.avg_selling_price.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold" style={{ color: '#E8231A' }}>
                      {p.revenue_contribution_pct}%
                    </td>
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
