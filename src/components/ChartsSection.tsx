"use client";

import React, { useState, useEffect } from "react";
import {
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  TrendingUp, 
  Store, 
  PieChart as PieIcon, 
  Utensils, 
  Clock, 
  Award,
  Layers
} from "lucide-react";
import {
  DailyDataPoint,
  OutletMetric,
  CategoryMetric,
  OrderTypeMetric,
  SettlementMetric,
  TopItemMetric,
  HourlyMetric,
} from "@/types/analytics";

interface ChartsSectionProps {
  dailySeries: DailyDataPoint[];
  outletBreakdown: OutletMetric[];
  categoryBreakdown: CategoryMetric[];
  orderTypeBreakdown: OrderTypeMetric[];
  settlementBreakdown: SettlementMetric[];
  topItems: TopItemMetric[];
  hourlyDistribution: HourlyMetric[];
}

const COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f59e0b", // amber
];

export default function ChartsSection({
  dailySeries,
  outletBreakdown,
  categoryBreakdown,
  orderTypeBreakdown,
  settlementBreakdown,
  topItems,
  hourlyDistribution,
}: ChartsSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [timelineGranularity, setTimelineGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [timelineMetric, setTimelineMetric] = useState<"revenue" | "orders">("revenue");
  const [itemRankMetric, setItemRankMetric] = useState<"revenue" | "quantity">("revenue");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 rounded-2xl bg-gray-900/40 border border-gray-800 flex items-center justify-center text-gray-500">
        Loading analytics charts...
      </div>
    );
  }

  // Format currency helpers with safety null/undefined check
  const formatCurrencyK = (num: number | undefined | null) => {
    if (num == null || isNaN(num)) return "₹0";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${num}`;
  };

  // Aggregate dailySeries for weekly/monthly view if selected
  const getProcessedTimeline = () => {
    if (timelineGranularity === "daily") return dailySeries;

    const map = new Map<string, { label: string; revenue: number; orders: number; items: number }>();

    for (const pt of dailySeries) {
      let key = pt.date.slice(0, 7); // Monthly: YYYY-MM
      let label = pt.date.slice(0, 7);

      if (timelineGranularity === "weekly") {
        const d = new Date(pt.date);
        const day = d.getDate();
        const weekNum = Math.ceil(day / 7);
        key = `${pt.date.slice(0, 7)}-W${weekNum}`;
        label = key;
      }

      let entry = map.get(key);
      if (!entry) {
        entry = { label, revenue: 0, orders: 0, items: 0 };
        map.set(key, entry);
      }
      entry.revenue += pt.revenue;
      entry.orders += pt.orders;
      entry.items += pt.items;
    }

    return Array.from(map.values()).map((v) => ({
      date: v.label,
      revenue: Math.round(v.revenue),
      orders: v.orders,
      items: v.items,
      aov: v.orders > 0 ? Math.round(v.revenue / v.orders) : 0,
    }));
  };

  const processedTimeline = getProcessedTimeline();

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111827] border border-gray-700 p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
          <p className="font-semibold text-gray-200 border-b border-gray-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center space-x-2" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span>
              <span className="font-bold text-white">
                {entry.dataKey === "revenue" || entry.name.toLowerCase().includes("revenue")
                  ? formatCurrencyK(entry.value)
                  : (entry.value ?? 0).toLocaleString("en-IN")}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Timeline Trend Chart */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Revenue & Sales Velocity Trends
              </h3>
              <p className="text-xs text-gray-400">
                Tracking historical throughput across {processedTimeline.length} time points
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {/* Metric Toggle */}
            <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setTimelineMetric("revenue")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  timelineMetric === "revenue" ? "bg-orange-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setTimelineMetric("orders")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  timelineMetric === "orders" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Orders Count
              </button>
            </div>

            {/* Granularity Toggle */}
            <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
              {(["daily", "weekly", "monthly"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setTimelineGranularity(g)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                    timelineGranularity === g ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={timelineMetric === "revenue" ? "#f97316" : "#3b82f6"}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={timelineMetric === "revenue" ? "#f97316" : "#3b82f6"}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                tickLine={false}
                tickFormatter={(v) => (timelineMetric === "revenue" ? formatCurrencyK(v) : v.toLocaleString())}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={timelineMetric}
                name={timelineMetric === "revenue" ? "Revenue" : "Orders"}
                stroke={timelineMetric === "revenue" ? "#f97316" : "#3b82f6"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Row: Outlet Breakdown + Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outlet Performance */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Outlet Revenue & Average Ticket
              </h3>
              <p className="text-xs text-gray-400">Bangalore outlet revenue comparison with AOV</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outletBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="outlet" stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatCurrencyK} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Gross Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Category Revenue Distribution
              </h3>
              <p className="text-xs text-gray-400">Gross sales contribution by menu group</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBreakdown}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={formatCurrencyK} />
                <YAxis dataKey="category" type="category" stroke="#9ca3af" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Category Revenue" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3-Column Row: Order Types + Settlements + Hourly Rush */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Fulfillment Types */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <PieIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Fulfillment Type</h3>
                <p className="text-xs text-gray-400">Dine-In vs Delivery vs Takeaway</p>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderTypeBreakdown}
                    dataKey="revenue"
                    nameKey="orderType"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {orderTypeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-800 text-xs">
            {orderTypeBreakdown.map((item, idx) => (
              <div key={item.orderType} className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-gray-300 font-medium">{item.orderType}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">{formatCurrencyK(item.revenue)}</span>
                  <span className="text-gray-400 text-[10px] ml-1">({item.sharePct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement Payment Gateways */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <PieIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Payment Gateways</h3>
                <p className="text-xs text-gray-400">Revenue share by settlement channel</p>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={settlementBreakdown}
                    dataKey="revenue"
                    nameKey="settlement"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {settlementBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-800 text-xs">
            {settlementBreakdown.map((item, idx) => (
              <div key={item.settlement} className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }}
                  />
                  <span className="text-gray-300 font-medium truncate max-w-[120px]">{item.settlement}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">{formatCurrencyK(item.revenue)}</span>
                  <span className="text-gray-400 text-[10px] ml-1">({item.sharePct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Rush Hours Heatmap */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Peak Hours Rush</h3>
                <p className="text-xs text-gray-400">Hourly order traffic (11:00 - 23:00)</p>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyDistribution.filter((h) => h.orders > 0)} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" name="Orders" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400 flex justify-between items-center">
            <span>Lunch Rush: 13:00 - 15:00</span>
            <span className="font-semibold text-orange-400">Dinner Peak: 19:00 - 21:00</span>
          </div>
        </div>
      </div>

      {/* Top 10 Best-Selling Menu Items */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Top 10 Best-Selling Menu Items
              </h3>
              <p className="text-xs text-gray-400">Ranked by gross sales volume and unit velocity</p>
            </div>
          </div>

          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => setItemRankMetric("revenue")}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                itemRankMetric === "revenue" ? "bg-orange-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              By Revenue
            </button>
            <button
              onClick={() => setItemRankMetric("quantity")}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                itemRankMetric === "quantity" ? "bg-orange-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              By Units Sold
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topItems.slice(0, 10).map((itm) => {
            const itemPrice = itm.avgPrice ?? itm.avg_price ?? 0;
            return (
              <div
                key={itm.item}
                className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-7 w-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-orange-400">
                    #{itm.rank}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[280px]">
                      {itm.item}
                    </h4>
                    <div className="text-[11px] text-gray-400 flex items-center space-x-2">
                      <span className="text-amber-400">{itm.category}</span>
                      <span>•</span>
                      <span>{(itm.quantity ?? 0).toLocaleString()} units sold</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-white">
                    {formatCurrencyK(itm.revenue)}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Avg ₹{itemPrice.toFixed(0)} / unit
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
