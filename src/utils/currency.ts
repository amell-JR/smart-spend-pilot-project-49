
import { Currency } from '@/hooks/useCurrencies';

export const formatCurrency = (
  amount: number,
  currency: Currency | { symbol: string; decimal_places: number }
): string => {
  const formattedAmount = amount.toFixed(currency.decimal_places);
  return `${currency.symbol}${formattedAmount}`;
};

export const parseCurrencyInput = (
  input: string,
  decimalPlaces: number = 2
): number => {
  // Remove any non-digit and non-decimal characters
  const cleaned = input.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Number(parsed.toFixed(decimalPlaces));
};

export const getCurrencyByCode = (
  currencies: Currency[],
  code: string
): Currency | undefined => {
  return currencies.find(c => c.code === code);
};
