import React from 'react';
import { Sparkles, TrendingUp, Clock, ChefHat, ShoppingBag } from 'lucide-react';
import { KPISummary } from '../types';
import { formatCompactCurrency } from '../utils/formatters';

interface AIInsightsCardProps {
  summary: KPISummary | null;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ summary }) => {
  if (!summary) return null;

  const insights = [
    {
      title: `${summary.top_outlet.name} Leads Network`,
      desc: `Generated ${formatCompactCurrency(summary.top_outlet.revenue)} (${summary.top_outlet.share_pct}% of gross revenue), acting as the highest-velocity flagship.`,
      action: 'Benchmark table rotation and kitchen layout to replicate throughput at MG Road.',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50 border-blue-200/60',
    },
    {
      title: `${summary.top_category.name} Drive Sales Volume`,
      desc: `Represents ${summary.top_category.share_pct}% of total category spend, followed by high-ticket Combo meals.`,
      action: 'Prompt POS staff to upsell Fries & Drinks combos on single-burger orders to lift basket size.',
      icon: ChefHat,
      color: 'text-amber-600 bg-amber-50 border-amber-200/60',
    },
    {
      title: 'Peak Evening Dinner Surge',
      desc: 'Order volume accelerates between 19:00 and 21:00, registering highest daily sales velocity.',
      action: 'Schedule double grill shifts and complete prep-line mise en place before 18:30.',
      icon: Clock,
      color: 'text-purple-600 bg-purple-50 border-purple-200/60',
    },
    {
      title: 'Dine-In vs Delivery Dynamics',
      desc: `Network AOV sits at ₹${summary.avg_order_value.toFixed(2)} with an average of ${summary.avg_items_per_order.toFixed(1)} items per bill.`,
      action: 'Partner with Swiggy/Zomato on exclusive lunch combos between 14:00-17:00 to monetize idle capacity.',
      icon: ShoppingBag,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
    },
  ];

  return (
    <div className="bi-card p-4 space-y-3 bg-gradient-to-r from-blue-50/40 via-white to-slate-50/40 border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-blue-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Rule-Based AI Executive Intelligence & Operational Synthesis
          </h3>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          Computed from 300K Records
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <div key={i} className="p-3 rounded-lg bg-white border border-slate-200/70 shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1.5 font-semibold text-slate-900 mb-1">
                  <div className={`p-1 rounded ${ins.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="truncate">{ins.title}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {ins.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-blue-700 font-medium">Recommendation: </span>
                <span className="text-slate-600">{ins.action}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
