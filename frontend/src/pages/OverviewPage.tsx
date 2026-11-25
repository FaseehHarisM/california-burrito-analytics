import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { 
  IndianRupee, 
  ShoppingBag, 
  Layers, 
  TrendingUp, 
  Store, 
  UtensilsCrossed,
  Award
} from 'lucide-react';
import { 
  KPISummary, 
  RevenueTrendItem, 
  OrdersTrendItem, 
  CategoryPerformanceItem, 
  DistributionItem, 
  ProductPerformanceItem, 
  OutletPerformanceItem 
} from '../types';
import { KPICard } from '../components/KPICard';
import { AIInsightsCard } from '../components/AIInsightsCard';
import { formatCurrency, formatCompactCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface OverviewPageProps {
  summary: KPISummary | null;
  revenueTrend: RevenueTrendItem[];
  ordersTrend: OrdersTrendItem[];
  categories: CategoryPerformanceItem[];
  orderTypes: DistributionItem[];
  settlements: DistributionItem[];
  topProducts: ProductPerformanceItem[];
  outlets: OutletPerformanceItem[];
  trendAggregation: 'daily' | 'weekly' | 'monthly';
  onAggregationChange: (agg: 'daily' | 'weekly' | 'monthly') => void;
  isLoading: boolean;
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  summary,
  revenueTrend,
  ordersTrend,
  categories,
  orderTypes,
  settlements,
  topProducts,
  outlets,
  trendAggregation,
  onAggregationChange,
  isLoading,
}) => {
  if (isLoading && !summary) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium">Loading Overview metrics...</p>
      </div>
    );
  }

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
      {/* 6 Core KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            title="Total Revenue"
            value={formatCompactCurrency(summary.total_revenue)}
            subtext={`Exact: ${formatCurrency(summary.total_revenue)}`}
            icon={IndianRupee}
            badge="Gross POS"
            badgeColor="blue"
          />
          <KPICard
            title="Total Orders"
            value={formatNumber(summary.total_orders)}
            subtext={`Avg Ticket: ₹${summary.avg_order_value.toFixed(0)}`}
            icon={ShoppingBag}
            badge="Unique Bills"
            badgeColor="emerald"
          />
          <KPICard
            title="Total Items Sold"
            value={formatNumber(summary.total_items_sold)}
            subtext={`Avg Basket: ${summary.avg_items_per_order.toFixed(1)} items`}
            icon={Layers}
            badge="Units"
            badgeColor="amber"
          />
          <KPICard
            title="Average Order Value"
            value={`₹${summary.avg_order_value.toFixed(2)}`}
            subtext="Revenue / Unique Bills"
            icon={TrendingUp}
            badge="AOV"
            badgeColor="purple"
          />
          <KPICard
            title="Avg Items / Order"
            value={summary.avg_items_per_order.toFixed(2)}
            subtext="Quantity / Unique Bills"
            icon={Layers}
            badge="Basket Size"
            badgeColor="blue"
          />
          <KPICard
            title="Total Outlets"
            value={summary.total_outlets.toString()}
            subtext="Bangalore Network"
            icon={Store}
            badge="Active"
            badgeColor="emerald"
          />
        </div>
      )}

      {/* Rule-based AI Executive Intelligence Card */}
      <AIInsightsCard summary={summary} />

      {/* Charts Grid: Row 1 - Revenue Trend & Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="bi-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                A. Revenue Trend
              </h3>
              <p className="text-xs text-slate-500">Gross revenue velocity over time</p>
            </div>
            {/* Aggregation Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200/60">
              {(['daily', 'weekly', 'monthly'] as const).map((agg) => (
                <button
                  key={agg}
                  onClick={() => onAggregationChange(agg)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                    trendAggregation === agg ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {agg}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="period" stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Trend Area Chart */}
        <div className="bi-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                B. Orders Volume Trend
              </h3>
              <p className="text-xs text-slate-500">Unique customer orders count</p>
            </div>
            <span className="text-xs text-slate-400 font-mono capitalize">{trendAggregation} view</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ordersTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="period" stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatNumber} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Unique Orders"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#orderGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid: Row 2 - Category Performance & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category Horizontal Bar Chart */}
        <div className="bi-card p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              C. Revenue by Category
            </h3>
            <p className="text-xs text-slate-500">Sales distribution across 7 menu groups</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} tickFormatter={formatCompactCurrency} />
                <YAxis dataKey="category" type="category" stroke="#475569" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Category Revenue" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products Horizontal Bar Chart */}
        <div className="bi-card p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              F. Top Selling Products
            </h3>
            <p className="text-xs text-slate-500">Ranked by unit sales volume</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
                <YAxis dataKey="product" type="category" stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantity_sold" name="Quantity Sold" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid: Row 3 - Order Types & Payment Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Type Distribution Donut Chart */}
        <div className="bi-card p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              D. Order Type Distribution
            </h3>
            <p className="text-xs text-slate-500">Dine-In vs Takeaway vs Delivery breakdown</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderTypes}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {orderTypes.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            {orderTypes.map((ot, idx) => (
              <div key={ot.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-700 font-medium">{ot.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">{formatCompactCurrency(ot.revenue)}</span>
                  <span className="text-slate-400 text-[10px] ml-1">({ot.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Distribution Donut Chart */}
        <div className="bi-card p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              E. Payment Method Distribution
            </h3>
            <p className="text-xs text-slate-500">Revenue split across settlement channels</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={settlements}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {settlements.map((_, index) => (
                    <Cell key={index} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            {settlements.map((s, idx) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }} />
                  <span className="text-slate-700 font-medium truncate max-w-[140px]">{s.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">{formatCompactCurrency(s.revenue)}</span>
                  <span className="text-slate-400 text-[10px] ml-1">({s.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Outlet Performance Summary Table */}
      <div className="bi-card p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            G. Outlet Performance Comparison
          </h3>
          <p className="text-xs text-slate-500">Bangalore outlet revenue and throughput rankings</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Outlet Name</th>
                <th className="py-2.5 px-4 text-right">Gross Revenue (₹)</th>
                <th className="py-2.5 px-4 text-right">Unique Orders</th>
                <th className="py-2.5 px-4 text-right">Items Sold</th>
                <th className="py-2.5 px-4 text-right">Average Order Value (AOV)</th>
                <th className="py-2.5 px-4 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outlets.map((o) => (
                <tr key={o.outlet_name} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{o.outlet_name}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900">
                    {formatCurrency(o.revenue)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {formatNumber(o.orders)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {formatNumber(o.items_sold)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-600">
                    ₹{o.aov.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
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
