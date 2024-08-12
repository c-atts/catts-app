const formatter = new Intl.NumberFormat(navigator.language, {
  maximumFractionDigits: 8,
});

export function formatNumber(number: number | bigint): string {
  return formatter.format(number);
}
