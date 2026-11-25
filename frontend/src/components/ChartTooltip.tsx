import React from 'react';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = React.memo(({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl text-xs space-y-1.5"
      style={{ border: '1px solid #C8C2AA' }}
    >
      {label && (
        <p className="font-bold pb-1" style={{ color: '#1B4332', borderBottom: '1px solid #E5E0D0' }}>
          {label}
        </p>
      )}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between space-x-4">
          <span className="flex items-center space-x-1.5 font-medium" style={{ color: '#5C5648' }}>
            <span
              className="h-2 w-2 rounded-full inline-block"
              style={{ backgroundColor: entry.color || '#1B4332' }}
            />
            <span>{entry.name}:</span>
          </span>
          <span className="font-bold font-mono" style={{ color: '#1B4332' }}>
            {entry.dataKey === 'revenue' ? formatCurrency(entry.value) : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
});

ChartTooltip.displayName = 'ChartTooltip';
