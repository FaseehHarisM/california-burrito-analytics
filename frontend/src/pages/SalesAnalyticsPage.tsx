import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Clock, Calendar, Store, CreditCard, ShoppingBag } from 'lucide-react';
import { FilterState } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatNumber } from '../utils/formatters';

interface SalesAnalyticsPageProps {
  filters: FilterState;
}

export const SalesAnalyticsPage: React.FC<SalesAnalyticsPageProps> = ({ filters }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salesView, setSalesView] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getSalesAnalytics(filters)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => console.error('Failed to load sales analytics:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters]);

  if (loading && !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium">Computing sales velocity trends...</p>
      </div>
    );
  }

  const activeTrend = salesView === 'monthly'
    ? data?.monthly_sales
    : salesView === 'weekly'
    ? data?.weekly_sales
    : data?.daily_sales;

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
      {/* Top Controls & Main Sales Velocity Line Chart */}
      <div className="bi-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Sales Revenue & Order Velocity
            </h3>
            <p className="text-xs text-slate-500">Switch between daily, weekly, and monthly rollup aggregations</p>
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200/60">
            {(['daily', 'weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSalesView(view)}
                className={`px-3 py-1 rounded-md capitalize transition-colors ${
                  salesView === view ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="period" stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatCompactCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Gross Sales"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Row: Day of Week & Hourly Rush */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Day of Week */}
        <div className="bi-card p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Sales by Day of Week
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.sales_by_day_of_week || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Sales Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Hour (Rush Hours) */}
        <div className="bi-card p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Peak Traffic & Rush Hours (11:00 - 23:00)
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.sales_by_hour || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94A3B8" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Hourly Revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3-Column Breakdown Row: Outlets, Fulfillment, Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* By Outlet */}
        <div className="bi-card p-4 space-y-3">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold text-xs border-b border-slate-100 pb-2">
            <Store className="h-3.5 w-3.5 text-blue-600" />
            <span>Sales by Outlet</span>
          </div>
          <div className="space-y-2 text-xs">
            {data?.sales_by_outlet?.map((o: any) => (
              <div key={o.outlet_name} className="flex items-center justify-between">
                <span className="text-slate-600 truncate max-w-[120px]">{o.outlet_name}</span>
                <div className="text-right font-mono">
                  <span className="font-semibold text-slate-900">{formatCompactCurrency(o.revenue)}</span>
                  <span className="text-slate-400 text-[10px] ml-1">({o.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Order Type */}
        <div className="bi-card p-4 space-y-3">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold text-xs border-b border-slate-100 pb-2">
            <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
            <span>Sales by Fulfillment Type</span>
          </div>
          <div className="space-y-2 text-xs">
            {data?.sales_by_order_type?.map((t: any) => (
              <div key={t.name} className="flex items-center justify-between">
                <span className="text-slate-600">{t.name}</span>
                <div className="text-right font-mono">
                  <span className="font-semibold text-slate-900">{formatCompactCurrency(t.revenue)}</span>
                  <span className="text-slate-400 text-[10px] ml-1">({t.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Payment Method */}
        <div className="bi-card p-4 space-y-3">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold text-xs border-b border-slate-100 pb-2">
            <CreditCard className="h-3.5 w-3.5 text-purple-600" />
            <span>Sales by Payment Method</span>
          </div>
          <div className="space-y-2 text-xs">
            {data?.sales_by_payment?.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between">
                <span className="text-slate-600 truncate max-w-[120px]">{p.name}</span>
                <div className="text-right font-mono">
                  <span className="font-semibold text-slate-900">{formatCompactCurrency(p.revenue)}</span>
                  <span className="text-slate-400 text-[10px] ml-1">({p.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
