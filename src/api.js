import { APPS_SCRIPT_URL, API_KEY } from './config';

export async function fetchActivities(year) {
  const params = new URLSearchParams({ apiKey: API_KEY });
  if (year) params.append('year', year);

  const res = await fetch(`${APPS_SCRIPT_URL}?${params}`);
  const json = await res.json();

  if (!json.success) throw new Error(json.error || 'Failed to fetch activities');

  // Normalize dates to YYYY-MM-DD without timezone shifting
  return json.data.map((a) => {
    const dateStr = String(a.date);
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return a;
    // Parse safely using date parts to avoid UTC/local timezone mismatch
    const parts = dateStr.split(/[-/T]/);
    const normalized = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    return { ...a, date: normalized };
  });
}

export async function createActivity(data) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ apiKey: API_KEY, action: 'create', data }),
  });
  const json = await res.json();

  if (!json.success) throw new Error(json.error || 'Failed to create activity');
  return json.data;
}

export async function updateActivity(id, data) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ apiKey: API_KEY, action: 'update', id, data }),
  });
  const json = await res.json();

  if (!json.success) throw new Error(json.error || 'Failed to update activity');
  return json.data;
}

export async function deleteActivity(id) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ apiKey: API_KEY, action: 'delete', id }),
  });
  const json = await res.json();

  if (!json.success) throw new Error(json.error || 'Failed to delete activity');
  return json;
}
