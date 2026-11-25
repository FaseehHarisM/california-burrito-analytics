import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface KPICardProps {
  title: string;
  value: string;
  numericValue?: number;
  formatter?: (val: number) => string;
  subtext: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'red' | 'green' | 'amber' | 'cream';
  staggerClass?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  numericValue,
  formatter,
  subtext,
  icon: Icon,
  badge,
  badgeColor = 'green',
  staggerClass = '',
}) => {
  const badgeStyles: Record<string, React.CSSProperties> = {
    red:   { backgroundColor: '#FDF0EF', color: '#E8231A', border: '1px solid rgba(232,35,26,0.22)' },
    green: { backgroundColor: '#EAF4EE', color: '#1B4332', border: '1px solid rgba(27,67,50,0.20)'  },
    amber: { backgroundColor: '#FEF9EC', color: '#92400E', border: '1px solid rgba(146,64,14,0.20)' },
    cream: { backgroundColor: '#F5F0DC', color: '#5C5648', border: '1px solid #C8C2AA'              },
  };

  return (
    <div
      className={`group bi-card bi-card-hover p-4 flex flex-col justify-between relative overflow-hidden ${staggerClass}`}
    >
      {/* Smooth gradient accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] transition-opacity duration-300"
        style={{
          background:
            badgeColor === 'green'
              ? 'linear-gradient(90deg, #1B4332 0%, #2D6A4F 100%)'
              : 'linear-gradient(90deg, #E8231A 0%, #F04E45 100%)',
        }}
      />

      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5 pt-0.5">
          <span
            className="text-[11px] font-bold uppercase tracking-wider leading-snug"
            style={{ color: '#7A7260' }}
          >
            {title}
          </span>
          <div
            className="p-2 rounded-xl shrink-0 transition-transform duration-300 ease-out group-hover:scale-110"
            style={{
              backgroundColor: badgeColor === 'green' ? '#EAF4EE' : '#FDF0EF',
              border:
                badgeColor === 'green'
                  ? '1px solid rgba(27,67,50,0.14)'
                  : '1px solid rgba(232,35,26,0.14)',
            }}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: badgeColor === 'green' ? '#1B4332' : '#E8231A' }}
            />
          </div>
        </div>

        <div
          className="text-2xl font-extrabold tracking-tight tabular-nums"
          style={{ color: '#1B4332' }}
        >
          {numericValue !== undefined && formatter ? (
            <AnimatedNumber value={numericValue} formatter={formatter} />
          ) : (
            value
          )}
        </div>
      </div>

      <div
        className="mt-3 pt-2.5 flex flex-wrap items-center justify-between gap-1.5 text-xs"
        style={{ borderTop: '1px solid #EDE8D8' }}
      >
        <span className="text-[11px] leading-tight font-medium min-w-0" style={{ color: '#7A7260' }}>
          {subtext}
        </span>
        {badge && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={badgeStyles[badgeColor]}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
