import React from 'react';
import { Lightbulb, TrendingUp, Clock, ChefHat, ShoppingBag } from 'lucide-react';
import { KPISummary } from '../types';
import { formatCompactCurrency } from '../utils/formatters';

interface AIInsightsCardProps {
  summary: KPISummary | null;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ summary }) => {
  if (!summary) return null;

  const insights = [
    {
      title: `${summary.top_outlet.name} Leads Sales`,
      desc: `Brought in ${formatCompactCurrency(summary.top_outlet.revenue)} (${summary.top_outlet.share_pct}% of total sales), your busiest location.`,
      action: 'Share best kitchen and counter workflows from this store with other locations.',
      icon: TrendingUp,
      accent: '#E8231A',
      bg: '#FDF0EF',
      border: 'rgba(232,35,26,0.20)',
    },
    {
      title: `${summary.top_category.name} Are Top Sellers`,
      desc: `Makes up ${summary.top_category.share_pct}% of food & drink revenue, followed closely by Combos.`,
      action: 'Encourage staff to suggest adding sides or drinks to boost order value.',
      icon: ChefHat,
      accent: '#1B4332',
      bg: '#EAF4EE',
      border: 'rgba(27,67,50,0.20)',
    },
    {
      title: 'Evening Dinner Rush (7–9 PM)',
      desc: 'Customer orders pick up sharply between 7:00 PM and 9:00 PM every evening.',
      action: 'Finish kitchen prep by 6:30 PM and assign extra counter staff during dinner hours.',
      icon: Clock,
      accent: '#2D6A4F',
      bg: '#EAF4EE',
      border: 'rgba(45,106,79,0.20)',
    },
    {
      title: `Avg Order: ₹${summary.avg_order_value.toFixed(0)}`,
      desc: `Customers buy an average of ${summary.avg_items_per_order.toFixed(1)} items per order across dine-in and delivery.`,
      action: 'Promote afternoon combo specials between 2:00 PM and 5:00 PM to lift quiet-hour orders.',
      icon: ShoppingBag,
      accent: '#92400E',
      bg: '#FEF9EC',
      border: 'rgba(146,64,14,0.20)',
    },
  ];

  return (
    <div
      className="bi-card p-4 space-y-3"
      style={{
        background: 'linear-gradient(135deg, #FAF8F0 0%, #FFFFFF 50%, #EAF4EE 100%)',
        borderLeft: '4px solid #E8231A',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded" style={{ backgroundColor: '#E8231A' }}>
            <Lightbulb className="h-3.5 w-3.5" style={{ color: '#F5F0DC' }} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1B4332' }}>
            Key Business Highlights
          </h3>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#FDF0EF', color: '#E8231A', border: '1px solid rgba(232,35,26,0.25)' }}
        >
          Updated from Store Sales
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <div
              key={i}
              className="p-3 rounded-lg flex flex-col justify-between space-y-2"
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${ins.border}`,
                boxShadow: '0 1px 3px rgba(27,67,50,0.05)',
              }}
            >
              <div>
                <div
                  className="flex items-center space-x-1.5 font-semibold mb-1"
                  style={{ color: '#1B4332' }}
                >
                  <div className="p-1 rounded shrink-0" style={{ backgroundColor: ins.bg }}>
                    <Icon className="h-3 w-3" style={{ color: ins.accent }} />
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
    </div>
  );
};
