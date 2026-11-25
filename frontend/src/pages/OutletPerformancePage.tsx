import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Store, TrendingUp, ShoppingBag, Clock, Layers, ArrowUpDown } from 'lucide-react';
import { FilterState, OutletPerformanceItem } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatNumber } from '../utils/formatters';

interface OutletPerformancePageProps {
  filters: FilterState;
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export const OutletPerformancePage: React.FC<OutletPerformancePageProps> = ({ filters }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('Koramangala');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getOutletAnalytics(filters, selectedOutlet)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => console.error('Failed to load outlet analytics:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters, selectedOutlet]);

  const drilldown = data?.selected_outlet_drilldown;
  const outletsList: OutletPerformanceItem[] = data?.outlets_comparison || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-lg text-xs space-y-1">
          <p className="font-semibold text-slate-800 border-b border-slate-100 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex items-center space-x-2" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span>
              <span className="font-bold text-slate-900">
                {entry.dataKey === 'revenue' ? formatCurrency(entry.value) : formatNumber(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Outlet Selection Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        <span className="text-xs text-slate-500 font-medium flex items-center space-x-1 mr-2">
          <Store className="h-4 w-4 text-blue-600" />
          <span>Select Store for Deep Drilldown:</span>
        </span>
        {outletsList.map((o) => (
          <button
            key={o.outlet_name}
            onClick={() => setSelectedOutlet(o.outlet_name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedOutlet === o.outlet_name
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {o.outlet_name}
          </button>
        ))}
      </div>

      {/* Selected Outlet Drilldown Cards & Charts */}
      {drilldown && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Mix for Outlet */}
            <div className="bi-card p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Category Revenue Mix — {drilldown.outlet_name}
              </h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={drilldown.category_mix} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 10 }} tickFormatter={formatCompactCurrency} />
                    <YAxis dataKey="category" type="category" stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Type Distribution for Outlet */}
            <div className="bi-card p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Fulfillment Channels — {drilldown.outlet_name}
              </h4>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={drilldown.order_type_distribution}
                      dataKey="revenue"
                      nameKey="order_type"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {drilldown.order_type_distribution.map((_: any, idx: number) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs border-t border-slate-100 pt-2">
                {drilldown.order_type_distribution.map((t: any, i: number) => (
                  <div key={t.order_type} className="flex justify-between items-center">
                    <span className="text-slate-600">{t.order_type}</span>
                    <span className="font-semibold text-slate-900">{formatCompactCurrency(t.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Rush for Outlet */}
            <div className="bi-card p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Hourly Rush — {drilldown.outlet_name}
              </h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={drilldown.hourly_traffic} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="hour" stroke="#94A3B8" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" name="Orders Count" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Outlet Comparison Table */}
      <div className="bi-card p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Network Outlets Master Comparison Matrix
          </h3>
          <p className="text-xs text-slate-500">Cross-store benchmarking across Bangalore locations</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Outlet Name</th>
                <th className="py-2.5 px-4 text-right">Gross Revenue</th>
                <th className="py-2.5 px-4 text-right">Unique Bills</th>
                <th className="py-2.5 px-4 text-right">AOV (Avg Ticket)</th>
                <th className="py-2.5 px-4 text-right">Total Items Sold</th>
                <th className="py-2.5 px-4 text-right">Avg Items/Order</th>
                <th className="py-2.5 px-4 text-right">Revenue Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outletsList.map((o) => (
                <tr
                  key={o.outlet_name}
                  onClick={() => setSelectedOutlet(o.outlet_name)}
                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    selectedOutlet === o.outlet_name ? 'bg-blue-50/40 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                    <Store className="h-3.5 w-3.5 text-blue-600" />
                    <span>{o.outlet_name}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(o.revenue)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{formatNumber(o.orders)}</td>
                  <td className="py-3 px-4 text-right font-mono text-blue-600 font-semibold">₹{o.aov.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{formatNumber(o.items_sold)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{(o.items_sold / (o.orders || 1)).toFixed(1)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                      {o.share_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
