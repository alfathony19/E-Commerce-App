// src/utils/formatCurrency.ts
export function formatCurrency(
  value: number,
  locale: string = "id-ID",
  currency: string = "IDR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0, // Rp 10.000
  }).format(value);
}
