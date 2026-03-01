// Parse YYYY-MM-DD string into { year, month (0-based), day } without timezone issues
export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}
