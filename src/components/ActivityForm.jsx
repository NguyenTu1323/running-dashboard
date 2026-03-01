import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

export default function ActivityForm({ onSubmit }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [minutes, setMinutes] = useState('');
  const [km, setKm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !minutes || !km) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await onSubmit({ date, minutes: Number(minutes), km: Number(km) });
      setMinutes('');
      setKm('');
      setDate(today);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Log Activity</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutes</label>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="30"
              min="1"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Km</label>
            <input
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="5.0"
              min="0.1"
              step="0.01"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Saving...' : 'Log Run'}
        </button>
      </form>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm Activity"
        message={`Date: ${date}\nMinutes: ${minutes}\nDistance: ${km} km`}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
