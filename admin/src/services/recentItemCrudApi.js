const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

async function toJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false || payload?.ok === false) {
    throw new Error(payload?.message || "Amalda xatolik.");
  }
  return payload;
}

export async function deleteRecentItem(section, item) {
  let url = '';
  if (section === 'movies') url = `${API_BASE}/api/movies/${item.id}`;
  if (section === 'actors') url = `${API_BASE}/api/actors/${item.id}`;
  if (section === 'banners') url = `${API_BASE}/api/banners/by-banner-id/${item.id}`;
  if (section === 'ads') url = `${API_BASE}/api/ads/${item.id}`;
  if (section === 'genres') url = `${API_BASE}/api/genres/${item.id}`;
  if (!url) throw new Error("Noto'g'ri bo'lim.");

  const response = await fetch(url, { method: 'DELETE', headers: { Accept: 'application/json' } });
  await toJson(response);
}

export async function updateRecentItem(section, item, payload) {
  let url = '';
  if (section === 'movies') url = `${API_BASE}/api/movies/${item.id}`;
  if (section === 'actors') url = `${API_BASE}/api/actors/${item.id}`;
  if (section === 'banners') url = `${API_BASE}/api/banners/by-banner-id/${item.id}`;
  if (section === 'ads') url = `${API_BASE}/api/ads/${item.id}`;
  if (section === 'genres') url = `${API_BASE}/api/genres/${item.id}`;
  if (!url) throw new Error("Noto'g'ri bo'lim.");

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload || {}),
  });
  const data = await toJson(response);
  return data?.data;
}
