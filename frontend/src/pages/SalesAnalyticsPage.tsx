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
import { ChartTooltip } from '../components/ChartTooltip';
import { formatCompactCurrency } from '../utils/formatters';

interface SalesAnalyticsPageProps {
  filters: FilterState;
}

export const SalesAnalyticsPage: React.FC<SalesAnalyticsPageProps> = ({ filters }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salesView, setSalesView] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    api.getSalesAnalytics(filters, ctrl.signal)
      .then((res) => setData(res))
      .catch((err) => {
        if (err?.name !== 'AbortError') console.error('Failed to load sales analytics:', err);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [filters]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bi-card p-5 h-80 shimmer-bg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bi-card p-5 h-72 shimmer-bg" />
          <div className="bi-card p-5 h-72 shimmer-bg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bi-card p-5 h-44 shimmer-bg" />
          <div className="bi-card p-5 h-44 shimmer-bg" />
          <div className="bi-card p-5 h-44 shimmer-bg" />
        </div>
      </div>
    );
  }

  const activeTrend = salesView === 'monthly'
    ? data?.monthly_sales
    : salesView === 'weekly'
    ? data?.weekly_sales
    : data?.daily_sales;

  return (
    <div
      className={`space-y-6 animate-fade-in transition-opacity duration-200 ${
        loading ? 'opacity-65 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Controls & Main Sales Chart */}
      <div className="bi-card bi-card-hover p-5 space-y-4">
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
            className="flex p-1 rounded-xl text-xs font-medium"
            style={{ backgroundColor: '#F3F0E6', border: '1px solid #D8D1BD' }}
          >
            {(['daily', 'weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSalesView(view)}
                className="px-3 py-1 rounded-lg capitalize transition-all duration-200 active:scale-95 cursor-pointer"
                style={
                  salesView === view
                    ? { backgroundColor: '#1B4332', color: '#F5F0DC', fontWeight: 600, boxShadow: '0 2px 6px rgba(27,67,50,0.2)' }
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
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Total Sales"
                stroke="#E8231A"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#E8231A', stroke: '#FFFFFF', strokeWidth: 2 }}
                animationDuration={650}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Row: Day of Week & Busiest Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bi-card bi-card-hover p-5 space-y-4">
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
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="revenue" name="Sales" fill="#1B4332" radius={[6, 6, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bi-card bi-card-hover p-5 space-y-4">
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
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="revenue" name="Hourly Sales" fill="#E8231A" radius={[6, 6, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3-Column Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bi-card bi-card-hover p-4 space-y-3">
          <div className="flex items-center space-x-2 font-semibold text-xs pb-2" style={{ color: '#1B4332', borderBottom: '1px solid #EDE8D8' }}>
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

        <div className="bi-card bi-card-hover p-4 space-y-3">
          <div className="flex items-center space-x-2 font-semibold text-xs pb-2" style={{ color: '#1B4332', borderBottom: '1px solid #EDE8D8' }}>
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

        <div className="bi-card bi-card-hover p-4 space-y-3">
          <div className="flex items-center space-x-2 font-semibold text-xs pb-2" style={{ color: '#1B4332', borderBottom: '1px solid #EDE8D8' }}>
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
