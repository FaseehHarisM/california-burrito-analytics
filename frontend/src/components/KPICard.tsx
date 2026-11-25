import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'red' | 'green' | 'amber' | 'cream';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeColor = 'green',
}) => {
  const badgeStyles: Record<string, React.CSSProperties> = {
    red:   { backgroundColor: '#FDF0EF', color: '#E8231A', border: '1px solid rgba(232,35,26,0.25)' },
    green: { backgroundColor: '#EAF4EE', color: '#1B4332', border: '1px solid rgba(27,67,50,0.25)'  },
    amber: { backgroundColor: '#FEF9EC', color: '#92400E', border: '1px solid rgba(146,64,14,0.20)' },
    cream: { backgroundColor: '#F5F0DC', color: '#5C5648', border: '1px solid #C8C2AA'              },
  };

  return (
    <div
      className="bi-card bi-card-hover p-4 flex flex-col justify-between"
      style={{ borderTop: '3px solid #E8231A' }}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold uppercase tracking-wide leading-tight"
            style={{ color: '#7A7260' }}
          >
            {title}
          </span>
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: '#FDF0EF', border: '1px solid rgba(232,35,26,0.15)' }}
          >
            <Icon className="h-4 w-4" style={{ color: '#E8231A' }} />
          </div>
        </div>

        <div
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#1B4332' }}
        >
          {value}
        </div>
      </div>

      <div
        className="mt-2.5 pt-2 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid #E5E0D0' }}
      >
        <span className="text-[11px] leading-tight" style={{ color: '#7A7260' }}>{subtext}</span>
        {badge && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-1"
            style={badgeStyles[badgeColor]}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
