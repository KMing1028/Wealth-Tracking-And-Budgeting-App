import { getCurrencySymbol } from './currencies';

export function formatCurrency(value, currencyCode = 'MYR') {
  const symbol = getCurrencySymbol(currencyCode);
  const absValue = Math.abs(value);
  let formatted;
  if (absValue >= 1000000) {
    formatted = (absValue / 1000000).toFixed(2) + 'M';
  } else {
    formatted = absValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  return `${symbol} ${value < 0 ? '-' : ''}${formatted}`;
}

export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatShortDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function formatPercent(value) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
