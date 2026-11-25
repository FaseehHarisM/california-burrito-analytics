import React from 'react';
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
} from 'lucide-react';
import {
  KPISummary,
  RevenueTrendItem,
  OrdersTrendItem,
  CategoryPerformanceItem,
  DistributionItem,
  ProductPerformanceItem,
  OutletPerformanceItem,
} from '../types';
import { KPICard } from '../components/KPICard';
import { AIInsightsCard } from '../components/AIInsightsCard';
import { ChartTooltip } from '../components/ChartTooltip';
import { formatCurrency, formatCompactCurrency, formatNumber } from '../utils/formatters';

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

const COLORS = ['#E8231A', '#1B4332', '#2D6A4F', '#C41D14', '#5C5648', '#F5A623', '#7A7260'];

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
  /* ── Sleek Shimmer Skeleton on Initial Cold Load ─────────────────── */
  if (isLoading && !summary) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bi-card p-4 h-32 space-y-3">
              <div className="h-3 w-20 rounded shimmer-bg" />
              <div className="h-7 w-24 rounded shimmer-bg" />
              <div className="h-3 w-full rounded shimmer-bg" />
            </div>
          ))}
        </div>
        <div className="bi-card p-5 h-36 space-y-3">
          <div className="h-4 w-48 rounded shimmer-bg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl shimmer-bg" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bi-card p-5 h-80 shimmer-bg" />
          <div className="bi-card p-5 h-80 shimmer-bg" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 animate-fade-in transition-opacity duration-200 ${
        isLoading ? 'opacity-65 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Graceful Empty Filter State */}
      {summary && summary.total_orders === 0 && (
        <div className="bi-card p-8 text-center space-y-1.5" style={{ borderLeft: '4px solid #E8231A' }}>
          <h4 className="text-sm font-bold" style={{ color: '#1B4332' }}>No Orders Match Selected Filters</h4>
          <p className="text-xs" style={{ color: '#7A7260' }}>
            Try adjusting your date range, store, category, or payment method filters to view store analytics.
          </p>
        </div>
      )}
      {/* 6 Core Summary Cards with Animated Numbers & Staggered Entrance */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KPICard
            title="Total Sales"
            value={formatCompactCurrency(summary.total_revenue)}
            numericValue={summary.total_revenue}
            formatter={formatCompactCurrency}
            subtext={formatCurrency(summary.total_revenue)}
            icon={IndianRupee}
            badge="Revenue"
            badgeColor="red"
            staggerClass="stagger-1"
          />
          <KPICard
            title="Total Orders"
            value={formatNumber(summary.total_orders)}
            numericValue={summary.total_orders}
            formatter={(v) => formatNumber(Math.round(v))}
            subtext={`Avg ₹${summary.avg_order_value.toFixed(0)} per bill`}
            icon={ShoppingBag}
            badge="Orders"
            badgeColor="green"
            staggerClass="stagger-2"
          />
          <KPICard
            title="Items Sold"
            value={formatNumber(summary.total_items_sold)}
            numericValue={summary.total_items_sold}
            formatter={(v) => formatNumber(Math.round(v))}
            subtext={`Avg ${summary.avg_items_per_order.toFixed(1)} per order`}
            icon={Layers}
            badge="Units"
            badgeColor="amber"
            staggerClass="stagger-3"
          />
          <KPICard
            title="Avg Order Value"
            value={`₹${summary.avg_order_value.toFixed(2)}`}
            numericValue={summary.avg_order_value}
            formatter={(v) => `₹${v.toFixed(2)}`}
            subtext="Average per customer"
            icon={TrendingUp}
            badge="Per Bill"
            badgeColor="green"
            staggerClass="stagger-4"
          />
          <KPICard
            title="Items Per Order"
            value={summary.avg_items_per_order.toFixed(2)}
            numericValue={summary.avg_items_per_order}
            formatter={(v) => v.toFixed(2)}
            subtext="Average items bought"
            icon={Layers}
            badge="Basket"
            badgeColor="cream"
            staggerClass="stagger-5"
          />
          <KPICard
            title="Active Stores"
            value={summary.total_outlets.toString()}
            numericValue={summary.total_outlets}
            formatter={(v) => Math.round(v).toString()}
            subtext="Bangalore Locations"
            icon={Store}
            badge="Outlets"
            badgeColor="green"
            staggerClass="stagger-6"
          />
        </div>
      )}

      {/* Business Highlights */}
      <AIInsightsCard summary={summary} />

      {/* Row 1: Sales Over Time & Orders Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bi-card bi-card-hover p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
                Sales Over Time
              </h3>
              <p className="text-xs" style={{ color: '#7A7260' }}>Total sales across selected dates</p>
            </div>
            <div
              className="flex p-1 rounded-xl text-xs font-medium"
              style={{ backgroundColor: '#F3F0E6', border: '1px solid #D8D1BD' }}
            >
              {(['daily', 'weekly', 'monthly'] as const).map((agg) => (
                <button
                  key={agg}
                  onClick={() => onAggregationChange(agg)}
                  className="px-2.5 py-1 rounded-lg capitalize transition-all duration-200 active:scale-95 cursor-pointer"
                  style={
                    trendAggregation === agg
                      ? { backgroundColor: '#1B4332', color: '#F5F0DC', boxShadow: '0 2px 6px rgba(27,67,50,0.2)' }
                      : { color: '#5C5648' }
                  }
                >
                  {agg}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bi-card bi-card-hover p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
                Orders Over Time
              </h3>
              <p className="text-xs" style={{ color: '#7A7260' }}>Number of customer orders placed</p>
            </div>
            <span
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize"
              style={{ backgroundColor: '#F3F0E6', color: '#5C5648' }}
            >
              {trendAggregation} view
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ordersTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4332" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D0" vertical={false} />
                <XAxis dataKey="period" stroke="#9C9480" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#9C9480" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatNumber} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Customer Orders"
                  stroke="#1B4332"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#orderGrad)"
                  animationDuration={650}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Menu Categories & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bi-card bi-card-hover p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              Sales by Menu Category
            </h3>
            <p className="text-xs" style={{ color: '#7A7260' }}>Revenue across your 7 food & drink groups</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D0" horizontal={false} />
                <XAxis type="number" stroke="#9C9480" tick={{ fontSize: 11 }} tickFormatter={formatCompactCurrency} />
                <YAxis dataKey="category" type="category" stroke="#5C5648" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="revenue" name="Sales" fill="#1B4332" radius={[0, 6, 6, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bi-card bi-card-hover p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              Top Selling Items
            </h3>
            <p className="text-xs" style={{ color: '#7A7260' }}>Most popular menu items by quantity sold</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D0" horizontal={false} />
                <XAxis type="number" stroke="#9C9480" tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
                <YAxis dataKey="product" type="category" stroke="#5C5648" tick={{ fontSize: 10 }} tickLine={false} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="quantity_sold" name="Units Sold" radius={[0, 6, 6, 0]} animationDuration={600}>
                  {topProducts.slice(0, 6).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Order Types & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bi-card bi-card-hover p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              How Customers Order
            </h3>
            <p className="text-xs" style={{ color: '#7A7260' }}>Dine-In, Delivery, and Takeaway breakdown</p>
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
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  animationDuration={650}
                >
                  {orderTypes.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 space-y-2 text-xs" style={{ borderTop: '1px solid #EDE8D8' }}>
            {orderTypes.map((ot, idx) => (
              <div key={ot.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium" style={{ color: '#5C5648' }}>{ot.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold" style={{ color: '#1B4332' }}>{formatCompactCurrency(ot.revenue)}</span>
                  <span className="text-[11px] ml-1.5" style={{ color: '#9C9480' }}>({ot.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bi-card bi-card-hover p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              Payment Methods
            </h3>
            <p className="text-xs" style={{ color: '#7A7260' }}>Sales split across payment options</p>
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
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  animationDuration={650}
                >
                  {settlements.map((_, index) => (
                    <Cell key={index} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 space-y-2 text-xs" style={{ borderTop: '1px solid #EDE8D8' }}>
            {settlements.map((s, idx) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }} />
                  <span className="font-medium truncate max-w-[140px]" style={{ color: '#5C5648' }}>{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold" style={{ color: '#1B4332' }}>{formatCompactCurrency(s.revenue)}</span>
                  <span className="text-[11px] ml-1.5" style={{ color: '#9C9480' }}>({s.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store Performance Summary Table with Visual Share Bars */}
      <div className="bi-card p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
            Store Comparison
          </h3>
          <p className="text-xs" style={{ color: '#7A7260' }}>Sales and order averages across all Bangalore stores</p>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #E5E0D0' }}>
          <table className="w-full text-left text-xs">
            <thead
              className="uppercase font-semibold"
              style={{ backgroundColor: '#F3F0E6', color: '#1B4332', borderBottom: '1px solid #C8C2AA' }}
            >
              <tr>
                <th className="py-3 px-4">Store Name</th>
                <th className="py-3 px-4 text-right">Total Sales (₹)</th>
                <th className="py-3 px-4 text-right">Orders</th>
                <th className="py-3 px-4 text-right">Items Sold</th>
                <th className="py-3 px-4 text-right">Avg Order Value</th>
                <th className="py-3 px-4 text-right">Share of Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outlets.map((o) => (
                <tr key={o.outlet_name} className="hover:bg-cb-cream-bg/90 transition-colors">
                  <td className="py-3 px-4 font-semibold" style={{ color: '#1B4332' }}>{o.outlet_name}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(o.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatNumber(o.orders)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatNumber(o.items_sold)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold" style={{ color: '#E8231A' }}>
                    ₹{o.aov.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center space-x-2 justify-end">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden hidden sm:block" style={{ backgroundColor: '#EDE8D8' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, o.share_pct * 3)}%`, backgroundColor: '#1B4332' }}
                        />
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full font-semibold text-[11px] min-w-[54px] text-center"
                        style={{ backgroundColor: '#EAF4EE', color: '#1B4332', border: '1px solid rgba(27,67,50,0.18)' }}
                      >
                        {o.share_pct}%
                      </span>
                    </div>
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
