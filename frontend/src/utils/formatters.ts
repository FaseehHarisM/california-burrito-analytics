export function formatCurrency(amount: number | undefined | null): string {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactCurrency(amount: number | undefined | null): string {
  if (amount == null || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount.toFixed(0)}`;
}

export function formatNumber(val: number | undefined | null): string {
  if (val == null || isNaN(val)) return '0';
  return val.toLocaleString('en-IN');
}

export function formatPercent(val: number | undefined | null): string {
  if (val == null || isNaN(val)) return '0.0%';
  return `${val.toFixed(1)}%`;
}
