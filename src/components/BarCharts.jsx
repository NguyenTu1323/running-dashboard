import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { parseDate } from '../dateUtils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BarCharts({ activities, year }) {
  const data = useMemo(() => {
    const monthly = MONTHS.map((month, i) => ({
      month,
      days: 0,
      minutes: 0,
      km: 0,
    }));

    const seenDates = new Set();
    activities.forEach((a) => {
      const d = parseDate(a.date);
      if (d.year === year) {
        const m = d.month;
        if (!seenDates.has(a.date)) {
          monthly[m].days += 1;
          seenDates.add(a.date);
        }
        monthly[m].minutes += Number(a.minutes);
        monthly[m].km += Number(a.km);
      }
    });

    // Round km to 1 decimal
    monthly.forEach((m) => { m.km = Math.round(m.km * 10) / 10; });

    return monthly;
  }, [activities, year]);

  const charts = [
    { key: 'days', label: 'Days per Month', color: '#39d353' },
    { key: 'minutes', label: 'Minutes per Month', color: '#22c55e' },
    { key: 'km', label: 'Km per Month', color: '#16a34a' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {charts.map((chart) => (
        <div
          key={chart.key}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{chart.label}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={chart.key !== 'days'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey={chart.key} fill={chart.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
