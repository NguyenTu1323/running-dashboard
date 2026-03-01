import { useMemo } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

// Convert JS getDay() (0=Sun) to Mon-based index (0=Mon, 6=Sun)
function toMonday(jsDay) {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function Heatmap({ activities, year }) {
  const { weeks, monthLabels } = useMemo(() => {
    const runDates = new Set(activities.map((a) => a.date));

    const jan1 = new Date(year, 0, 1);
    const dec31 = new Date(year, 11, 31);

    const jan1MonIdx = toMonday(jan1.getDay());
    const firstMonday = new Date(year, 0, 1 - jan1MonIdx);

    const dec31MonIdx = toMonday(dec31.getDay());
    const lastSunday = new Date(year, 11, 31 + (6 - dec31MonIdx));

    const totalDays = Math.round((lastSunday - firstMonday) / 86400000) + 1;
    const totalWeeks = totalDays / 7;

    const weeksArr = [];
    const labels = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const weekCells = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(
          firstMonday.getFullYear(),
          firstMonday.getMonth(),
          firstMonday.getDate() + w * 7 + d
        );
        const y = date.getFullYear();
        const m = date.getMonth();
        const day = date.getDate();
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const inYear = y === year;

        weekCells.push({
          date: dateStr,
          inYear,
          hasRun: inYear && runDates.has(dateStr),
        });

        if (d === 0 && m !== lastMonth && inYear) {
          labels.push({ week: w, label: MONTHS[m] });
          lastMonth = m;
        }
      }
      weeksArr.push(weekCells);
    }

    const labelPositions = labels.map((lbl) => ({
      ...lbl,
      px: lbl.week * 14,
    }));

    return { weeks: weeksArr, monthLabels: labelPositions };
  }, [activities, year]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
        {/* Month labels */}
        <div style={{ display: 'flex', marginLeft: 28, marginBottom: 4, position: 'relative', height: 16 }}>
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="text-xs text-gray-400 dark:text-gray-500"
              style={{ position: 'absolute', left: m.px }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 2 }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ width: 24, height: 12, fontSize: 10, lineHeight: '12px', textAlign: 'right', paddingRight: 4 }}
                className="text-gray-400 dark:text-gray-500">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: 2 }}>
            {weeks.map((weekCells, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {weekCells.map((cell, di) => {
                  if (!cell.inYear) {
                    return <div key={di} style={{ width: 12, height: 12 }} />;
                  }
                  return (
                    <div
                      key={di}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        backgroundColor: cell.hasRun ? '#39d353' : undefined,
                      }}
                      className={cell.hasRun ? '' : 'bg-gray-200 dark:bg-gray-700'}
                      title={`${cell.date}${cell.hasRun ? ' - Run' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
