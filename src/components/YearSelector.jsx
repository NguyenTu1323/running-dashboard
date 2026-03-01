export default function YearSelector({ year, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2020; y--) {
    years.push(y);
  }

  return (
    <select
      value={year}
      onChange={(e) => onChange(Number(e.target.value))}
      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      {years.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}
