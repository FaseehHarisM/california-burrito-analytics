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
import { Clock, Calendar, Store, CreditCard, ShoppingBag } from 'lucide-react';
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
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div
          className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#E8231A', borderTopColor: 'transparent' }}
        />
        <p className="text-xs font-medium" style={{ color: '#7A7260' }}>Loading sales trends...</p>
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
      {/* Top Controls & Main Sales Velocity Line Chart */}
      <div className="bi-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              Sales Over Time
            </h3>
            <p className="text-xs" style={{ color: '#7A7260' }}>
              View daily, weekly, or monthly store sales
            </p>
          </div>

          <div
            className="flex p-0.5 rounded-lg text-xs font-medium"
            style={{ backgroundColor: '#F3F0E6', border: '1px solid #C8C2AA' }}
          >
            {(['daily', 'weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSalesView(view)}
                className="px-3 py-1 rounded-md capitalize transition-colors"
                style={
                  salesView === view
                    ? { backgroundColor: '#1B4332', color: '#F5F0DC', fontWeight: 600 }
                    : { color: '#5C5648' }
                }
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D0" vertical={false} />
              <XAxis dataKey="period" stroke="#9C9480" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#9C9480" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatCompactCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Gross Sales"
                stroke="#E8231A"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#E8231A' }}
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
            <Calendar className="h-4 w-4" style={{ color: '#1B4332' }} />
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              Sales by Day of Week
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.sales_by_day_of_week || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D0" vertical={false} />
                <XAxis dataKey="day" stroke="#9C9480" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#9C9480" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Sales Revenue" fill="#1B4332" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Hour (Rush Hours) */}
        <div className="bi-card p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" style={{ color: '#E8231A' }} />
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              Busiest Hours (11 AM – 11 PM)
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.sales_by_hour || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D0" vertical={false} />
                <XAxis dataKey="hour" stroke="#9C9480" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#9C9480" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Hourly Revenue" fill="#E8231A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3-Column Breakdown Row: Outlets, Fulfillment, Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* By Outlet */}
        <div className="bi-card p-4 space-y-3">
          <div className="flex items-center space-x-2 font-semibold text-xs pb-2" style={{ color: '#1B4332', borderBottom: '1px solid #E5E0D0' }}>
            <Store className="h-3.5 w-3.5" style={{ color: '#E8231A' }} />
            <span>Sales by Store</span>
          </div>
          <div className="space-y-2 text-xs">
            {data?.sales_by_outlet?.map((o: any) => (
              <div key={o.outlet_name} className="flex items-center justify-between">
                <span className="truncate max-w-[120px]" style={{ color: '#5C5648' }}>{o.outlet_name}</span>
                <div className="text-right font-mono">
                  <span className="font-semibold" style={{ color: '#1B4332' }}>{formatCompactCurrency(o.revenue)}</span>
                  <span className="text-[10px] ml-1" style={{ color: '#9C9480' }}>({o.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Order Type */}
        <div className="bi-card p-4 space-y-3">
          <div className="flex items-center space-x-2 font-semibold text-xs pb-2" style={{ color: '#1B4332', borderBottom: '1px solid #E5E0D0' }}>
            <ShoppingBag className="h-3.5 w-3.5" style={{ color: '#2D6A4F' }} />
            <span>Sales by Order Type</span>
          </div>
          <div className="space-y-2 text-xs">
            {data?.sales_by_order_type?.map((t: any) => (
              <div key={t.name} className="flex items-center justify-between">
                <span style={{ color: '#5C5648' }}>{t.name}</span>
                <div className="text-right font-mono">
                  <span className="font-semibold" style={{ color: '#1B4332' }}>{formatCompactCurrency(t.revenue)}</span>
                  <span className="text-[10px] ml-1" style={{ color: '#9C9480' }}>({t.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Payment Method */}
        <div className="bi-card p-4 space-y-3">
          <div className="flex items-center space-x-2 font-semibold text-xs pb-2" style={{ color: '#1B4332', borderBottom: '1px solid #E5E0D0' }}>
            <CreditCard className="h-3.5 w-3.5" style={{ color: '#E8231A' }} />
            <span>Sales by Payment Method</span>
          </div>
          <div className="space-y-2 text-xs">
            {data?.sales_by_payment?.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between">
                <span className="truncate max-w-[120px]" style={{ color: '#5C5648' }}>{p.name}</span>
                <div className="text-right font-mono">
                  <span className="font-semibold" style={{ color: '#1B4332' }}>{formatCompactCurrency(p.revenue)}</span>
                  <span className="text-[10px] ml-1" style={{ color: '#9C9480' }}>({p.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
