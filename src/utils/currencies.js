export const CURRENCIES = [
  { code: 'MYR', label: 'MYR (Malaysia)', symbol: 'RM' },
  { code: 'USD', label: 'USD (United States)', symbol: '$' },
  { code: 'SGD', label: 'SGD (Singapore)', symbol: 'S$' },
  { code: 'THB', label: 'THB (Thailand)', symbol: '฿' },
  { code: 'PHP', label: 'PHP (Philippines)', symbol: '₱' },
  { code: 'IDR', label: 'IDR (Indonesia)', symbol: 'Rp' },
  { code: 'KRW', label: 'KRW (South Korea)', symbol: '₩' },
  { code: 'JPY', label: 'JPY (Japan)', symbol: '¥' },
  { code: 'GBP', label: 'GBP (United Kingdom)', symbol: '£' },
  { code: 'EUR', label: 'EUR (Eurozone)', symbol: '€' },
  { code: 'CAD', label: 'CAD (Canada)', symbol: 'CA$' },
  { code: 'AUD', label: 'AUD (Australia)', symbol: 'A$' },
  { code: 'INR', label: 'INR (India)', symbol: '₹' },
  { code: 'CNY', label: 'CNY (China)', symbol: '¥' },
  { code: 'HKD', label: 'HKD (Hong Kong)', symbol: 'HK$' },
  { code: 'TWD', label: 'TWD (Taiwan)', symbol: 'NT$' },
  { code: 'VND', label: 'VND (Vietnam)', symbol: '₫' },
  { code: 'PKR', label: 'PKR (Pakistan)', symbol: '₨' },
  { code: 'BDT', label: 'BDT (Bangladesh)', symbol: '৳' },
  { code: 'AED', label: 'AED (United Arab Emirates)', symbol: 'د.إ' },
];

export function getCurrencySymbol(code) {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}
