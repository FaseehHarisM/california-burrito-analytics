import React, { useState } from 'react';
import { Lightbulb, TrendingUp, Clock, ChefHat, ShoppingBag, ChevronDown } from 'lucide-react';
import { KPISummary } from '../types';
import { formatCompactCurrency } from '../utils/formatters';

interface AIInsightsCardProps {
  summary: KPISummary | null;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ summary }) => {
  const [expanded, setExpanded] = useState(true);

  if (!summary) return null;

  const insights = [
    {
      title: `${summary.top_outlet.name} Leads Sales`,
      desc: `Brought in ${formatCompactCurrency(summary.top_outlet.revenue)} (${summary.top_outlet.share_pct}% of total sales), your busiest location.`,
      action: 'Share best kitchen and counter workflows from this store with other locations.',
      icon: TrendingUp,
      accent: '#E8231A',
      bg: '#FDF0EF',
      border: 'rgba(232,35,26,0.18)',
    },
    {
      title: `${summary.top_category.name} Are Top Sellers`,
      desc: `Makes up ${summary.top_category.share_pct}% of food & drink revenue, followed closely by Combos.`,
      action: 'Encourage staff to suggest adding sides or drinks to boost order value.',
      icon: ChefHat,
      accent: '#1B4332',
      bg: '#EAF4EE',
      border: 'rgba(27,67,50,0.18)',
    },
    {
      title: 'Evening Dinner Rush (7–9 PM)',
      desc: 'Customer orders pick up sharply between 7:00 PM and 9:00 PM every evening.',
      action: 'Finish kitchen prep by 6:30 PM and assign extra counter staff during dinner hours.',
      icon: Clock,
      accent: '#2D6A4F',
      bg: '#EAF4EE',
      border: 'rgba(45,106,79,0.18)',
    },
    {
      title: `Avg Order: ₹${summary.avg_order_value.toFixed(0)}`,
      desc: `Customers buy an average of ${summary.avg_items_per_order.toFixed(1)} items per order across dine-in and delivery.`,
      action: 'Promote afternoon combo specials between 2:00 PM and 5:00 PM to lift quiet-hour orders.',
      icon: ShoppingBag,
      accent: '#92400E',
      bg: '#FEF9EC',
      border: 'rgba(146,64,14,0.18)',
    },
  ];

  return (
    <div
      className="bi-card p-4 space-y-3 stagger-6"
      style={{
        background: 'linear-gradient(135deg, #FAF8F0 0%, #FFFFFF 55%, #EAF4EE 100%)',
        borderLeft: '4px solid #E8231A',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg shadow-xs" style={{ backgroundColor: '#E8231A' }}>
            <Lightbulb className="h-3.5 w-3.5" style={{ color: '#F5F0DC' }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
              Key Business Highlights
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full hidden sm:inline-block"
            style={{ backgroundColor: '#FDF0EF', color: '#E8231A', border: '1px solid rgba(232,35,26,0.22)' }}
          >
            Updated from Store Sales
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            style={{ backgroundColor: '#FFFFFF', color: '#1B4332', border: '1px solid #D8D1BD' }}
          >
            <span>{expanded ? 'Hide' : 'Show'}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-slide-down">
          {insights.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <div
                key={i}
                className="p-3.5 rounded-xl flex flex-col justify-between space-y-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${ins.border}`,
                  boxShadow: '0 1px 3px rgba(27,67,50,0.04)',
                }}
              >
                <div>
                  <div
                    className="flex items-center space-x-2 font-semibold mb-1.5"
                    style={{ color: '#1B4332' }}
                  >
                    <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: ins.bg }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: ins.accent }} />
                    </div>
                    <span className="leading-snug">{ins.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#5C5648' }}>
                    {ins.desc}
                  </p>
                </div>

                <div className="pt-2 text-[11px]" style={{ borderTop: `1px solid ${ins.border}` }}>
                  <span className="font-semibold" style={{ color: ins.accent }}>Tip: </span>
                  <span style={{ color: '#5C5648' }}>{ins.action}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
