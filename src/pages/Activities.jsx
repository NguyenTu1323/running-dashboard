import { useState, useEffect, useCallback } from 'react';
import YearSelector from '../components/YearSelector';
import ConfirmDialog from '../components/ConfirmDialog';
import { fetchActivities, updateActivity, deleteActivity } from '../api';

export default function Activities() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ date: '', minutes: '', km: '' });

  // Delete confirm state
  const [deleteId, setDeleteId] = useState(null);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchActivities(year);
      // Sort by date, newest first
      data.sort((a, b) => b.date.localeCompare(a.date));
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

  const showToast = (msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(''), duration);
  };

  const handleEdit = (activity) => {
    setEditId(activity.id);
    setEditData({
      date: activity.date,
      minutes: String(activity.minutes),
      km: String(activity.km),
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateActivity(editId, {
        date: editData.date,
        minutes: Number(editData.minutes),
        km: Number(editData.km),
      });
      setEditId(null);
      showToast('Activity updated!');
      loadActivities();
    } catch (err) {
      showToast('Error: ' + err.message, 5000);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteActivity(deleteId);
      setDeleteId(null);
      showToast('Activity deleted!');
      loadActivities();
    } catch (err) {
      showToast('Error: ' + err.message, 5000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
          toast.startsWith('Error') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Activities</h1>
        <YearSelector year={year} onChange={setYear} />
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : activities.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No activities found for {year}.</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Minutes</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Km</th>
                <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  {editId === a.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editData.minutes}
                          onChange={(e) => setEditData({ ...editData, minutes: e.target.value })}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-20"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editData.km}
                          step="0.1"
                          onChange={(e) => setEditData({ ...editData, km: e.target.value })}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-20"
                        />
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{a.date}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{a.minutes}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{a.km}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(a)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
