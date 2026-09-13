export interface CurrencyDef {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { code: 'PLN', symbol: 'zł', label: 'Polish Złoty' },
];

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '€';
}
