"use client";

import React from "react";
import { 
  IndianRupee, 
  ShoppingBag, 
  Layers, 
  TrendingUp, 
  Store, 
  UtensilsCrossed 
} from "lucide-react";
import { KPIData } from "@/types/analytics";

interface KPIGridProps {
  kpis: KPIData;
}

export default function KPIGrid({ kpis }: KPIGridProps) {
  const formatCurrency = (val: number | undefined | null) => {
    if (val == null || isNaN(val)) return "₹0";
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const aov = kpis.avgOrderValue ?? 0;
  const avgItems = kpis.avgItemsPerOrder ?? 0;
  const topOutletRev = kpis.topOutlet?.revenue ?? 0;
  const topOutletShare = kpis.topOutlet?.sharePct ?? 0;
  const topCatRev = kpis.topCategory?.revenue ?? 0;
  const topCatShare = kpis.topCategory?.sharePct ?? 0;

  const cards = [
    {
      title: "Total Net Revenue",
      value: formatCurrency(kpis.totalRevenue),
      subtext: `Exact: ₹${(kpis.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "from-orange-500/20 to-amber-500/5",
      borderColor: "border-orange-500/30",
      textColor: "text-orange-400",
      iconBg: "bg-orange-500/10 text-orange-400",
    },
    {
      title: "Total Orders (Bills)",
      value: (kpis.totalOrders ?? 0).toLocaleString("en-IN"),
      subtext: `Avg Ticket: ₹${aov.toFixed(0)} / order`,
      icon: ShoppingBag,
      color: "from-blue-500/20 to-cyan-500/5",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      iconBg: "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Total Units Sold",
      value: (kpis.totalItemsSold ?? 0).toLocaleString("en-IN"),
      subtext: `Avg Basket: ${avgItems.toFixed(1)} items / order`,
      icon: Layers,
      color: "from-emerald-500/20 to-teal-500/5",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Average Order Value (AOV)",
      value: `₹${aov.toFixed(2)}`,
      subtext: "Net spend per completed order",
      icon: TrendingUp,
      color: "from-purple-500/20 to-pink-500/5",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400",
      iconBg: "bg-purple-500/10 text-purple-400",
    },
    {
      title: "Top Performing Outlet",
      value: kpis.topOutlet?.name || "N/A",
      subtext: `${formatCurrency(topOutletRev)} (${topOutletShare}% share)`,
      icon: Store,
      color: "from-cyan-500/20 to-sky-500/5",
      borderColor: "border-cyan-500/30",
      textColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10 text-cyan-400",
    },
    {
      title: "Top Menu Category",
      value: kpis.topCategory?.name || "N/A",
      subtext: `${formatCurrency(topCatRev)} (${topCatShare}% share)`,
      icon: UtensilsCrossed,
      color: "from-amber-500/20 to-yellow-500/5",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400",
      iconBg: "bg-amber-500/10 text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-gradient-to-b ${c.color} bg-[#111827] border ${c.borderColor} shadow-lg transition-transform hover:-translate-y-0.5 duration-200`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-lg ${c.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {c.value}
            </div>
            <div className="text-[11px] text-gray-400 mt-1 truncate">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
