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
import { Store } from 'lucide-react';
import { FilterState, OutletPerformanceItem } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatNumber } from '../utils/formatters';

interface OutletPerformancePageProps {
  filters: FilterState;
}

const COLORS = ['#E8231A', '#1B4332', '#2D6A4F', '#C41D14', '#5C5648', '#F5A623'];

export const OutletPerformancePage: React.FC<OutletPerformancePageProps> = ({ filters }) => {
  const [data, setData] = useState<any>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('Koramangala');

  useEffect(() => {
    let isMounted = true;
    api.getOutletAnalytics(filters, selectedOutlet)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => console.error('Failed to load outlet analytics:', err));

    return () => { isMounted = false; };
  }, [filters, selectedOutlet]);

  const drilldown = data?.selected_outlet_drilldown;
  const outletsList: OutletPerformanceItem[] = data?.outlets_comparison || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2.5 rounded-lg shadow-lg text-xs space-y-1" style={{ border: '1px solid #C8C2AA' }}>
          <p className="font-semibold pb-1" style={{ color: '#1B4332', borderBottom: '1px solid #E5E0D0' }}>{label}</p>
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
      <div
        className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl shadow-xs"
        style={{ border: '1px solid #C8C2AA' }}
      >
        <span className="text-xs font-medium flex items-center space-x-1 mr-2" style={{ color: '#5C5648' }}>
          <Store className="h-4 w-4" style={{ color: '#E8231A' }} />
          <span>Choose a Store to Inspect:</span>
        </span>
        {outletsList.map((o) => (
          <button
            key={o.outlet_name}
            onClick={() => setSelectedOutlet(o.outlet_name)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={
              selectedOutlet === o.outlet_name
                ? { backgroundColor: '#E8231A', color: '#F5F0DC', boxShadow: '0 2px 5px rgba(232,35,26,0.25)' }
                : { backgroundColor: '#F3F0E6', color: '#1B4332' }
            }
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
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
                Category Sales — {drilldown.outlet_name}
              </h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={drilldown.category_mix} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D0" horizontal={false} />
                    <XAxis type="number" stroke="#9C9480" tick={{ fontSize: 10 }} tickFormatter={formatCompactCurrency} />
                    <YAxis dataKey="category" type="category" stroke="#5C5648" tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#E8231A" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Type Distribution for Outlet */}
            <div className="bi-card p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
                Order Types — {drilldown.outlet_name}
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
              <div className="space-y-1 text-xs pt-2" style={{ borderTop: '1px solid #E5E0D0' }}>
                {drilldown.order_type_distribution.map((t: any, idx: number) => (
                  <div key={t.order_type} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span style={{ color: '#5C5648' }}>{t.order_type}</span>
                    </div>
                    <span className="font-semibold" style={{ color: '#1B4332' }}>{formatCompactCurrency(t.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Rush for Outlet */}
            <div className="bi-card p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
                Busy Hours — {drilldown.outlet_name}
              </h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={drilldown.hourly_traffic} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D0" vertical={false} />
                    <XAxis dataKey="hour" stroke="#9C9480" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis stroke="#9C9480" tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" name="Orders Count" fill="#1B4332" radius={[3, 3, 0, 0]} />
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
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
            Store Comparison
          </h3>
          <p className="text-xs" style={{ color: '#7A7260' }}>Compare sales, order sizes, and customer demand across Bangalore stores</p>
        </div>

        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #E5E0D0' }}>
          <table className="w-full text-left text-xs">
            <thead
              className="uppercase font-semibold"
              style={{ backgroundColor: '#F3F0E6', color: '#1B4332', borderBottom: '1px solid #C8C2AA' }}
            >
              <tr>
                <th className="py-2.5 px-4">Store Name</th>
                <th className="py-2.5 px-4 text-right">Total Sales</th>
                <th className="py-2.5 px-4 text-right">Orders</th>
                <th className="py-2.5 px-4 text-right">Avg Order Value</th>
                <th className="py-2.5 px-4 text-right">Items Sold</th>
                <th className="py-2.5 px-4 text-right">Items / Order</th>
                <th className="py-2.5 px-4 text-right">Sales Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outletsList.map((o) => {
                const isSelected = selectedOutlet === o.outlet_name;
                return (
                  <tr
                    key={o.outlet_name}
                    onClick={() => setSelectedOutlet(o.outlet_name)}
                    className="cursor-pointer transition-colors"
                    style={
                      isSelected
                        ? { backgroundColor: '#FDF0EF', fontWeight: 600 }
                        : undefined
                    }
                  >
                    <td className="py-3 px-4 font-bold flex items-center space-x-2" style={{ color: '#1B4332' }}>
                      <Store className="h-3.5 w-3.5" style={{ color: isSelected ? '#E8231A' : '#2D6A4F' }} />
                      <span>{o.outlet_name}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(o.revenue)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{formatNumber(o.orders)}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold" style={{ color: '#E8231A' }}>₹{o.aov.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{formatNumber(o.items_sold)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{(o.items_sold / (o.orders || 1)).toFixed(1)}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className="px-2 py-0.5 rounded-full font-bold text-[11px]"
                        style={{ backgroundColor: '#EAF4EE', color: '#1B4332', border: '1px solid rgba(27,67,50,0.2)' }}
                      >
                        {o.share_pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
