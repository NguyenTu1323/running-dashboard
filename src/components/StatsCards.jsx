import { useMemo } from 'react';
import { parseDate } from '../dateUtils';

export default function StatsCards({ activities }) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const yearActivities = activities.filter((a) => {
      const d = parseDate(a.date);
      return d.year === currentYear;
    });

    const monthActivities = yearActivities.filter((a) => {
      const d = parseDate(a.date);
      return d.month === currentMonth;
    });

    const yearUniqueDays = new Set(yearActivities.map((a) => a.date)).size;
    const monthUniqueDays = new Set(monthActivities.map((a) => a.date)).size;

    return {
      yearDays: yearUniqueDays,
      yearMinutes: yearActivities.reduce((sum, a) => sum + Number(a.minutes), 0),
      yearKm: yearActivities.reduce((sum, a) => sum + Number(a.km), 0),
      monthDays: monthUniqueDays,
      monthMinutes: monthActivities.reduce((sum, a) => sum + Number(a.minutes), 0),
      monthKm: monthActivities.reduce((sum, a) => sum + Number(a.km), 0),
    };
  }, [activities]);

  const cards = [
    { label: 'Days (Year)', value: stats.yearDays },
    { label: 'Minutes (Year)', value: stats.yearMinutes.toLocaleString() },
    { label: 'Km (Year)', value: stats.yearKm.toFixed(1) },
    { label: 'Days (Month)', value: stats.monthDays },
    { label: 'Minutes (Month)', value: stats.monthMinutes.toLocaleString() },
    { label: 'Km (Month)', value: stats.monthKm.toFixed(1) },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{card.value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
