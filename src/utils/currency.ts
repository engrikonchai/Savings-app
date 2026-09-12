import { CurrencyCode } from '../types/models';

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  EUR: 'en-IE',
  USD: 'en-US',
  GBP: 'en-GB',
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options?: { compact?: boolean },
): string {
  const rounded = Math.round(amount);
  try {
    return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: 'currency',
      currency,
      maximumFractionDigits: options?.compact ? 0 : 0,
      minimumFractionDigits: 0,
    }).format(rounded);
  } catch {
    return `${CURRENCY_SYMBOLS[currency]}${rounded.toLocaleString()}`;
  }
}

export function formatAmountShort(amount: number, currency: CurrencyCode): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const rounded = Math.round(Math.abs(amount));
  return `${symbol}${rounded.toLocaleString()}`;
}
