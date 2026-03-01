import { useState, useEffect, useCallback } from 'react';
import ActivityForm from '../components/ActivityForm';
import Heatmap from '../components/Heatmap';
import StatsCards from '../components/StatsCards';
import BarCharts from '../components/BarCharts';
import YearSelector from '../components/YearSelector';
import { fetchActivities, createActivity } from '../api';

export default function Dashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchActivities(year);
      setActivities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleCreate = async (data) => {
    try {
      await createActivity(data);
      setToast('Activity logged!');
      setTimeout(() => setToast(''), 3000);
      loadActivities();
    } catch (err) {
      setToast('Error: ' + err.message);
      setTimeout(() => setToast(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
          toast.startsWith('Error')
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
        }`}>
          {toast}
        </div>
      )}

      {/* Activity Form */}
      <ActivityForm onSubmit={handleCreate} />

      {/* Year Selector + Heatmap */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Activity Heatmap</h2>
          <YearSelector year={year} onChange={setYear} />
        </div>
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <Heatmap activities={activities} year={year} />
        )}
      </div>

      {/* Stats */}
      {!loading && !error && <StatsCards activities={activities} />}

      {/* Bar Charts */}
      {!loading && !error && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Monthly Breakdown</h2>
          <BarCharts activities={activities} year={year} />
        </div>
      )}
    </div>
  );
}
