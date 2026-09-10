const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

async function toJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false || payload?.ok === false) {
    throw new Error(payload?.message || "Server bilan ulanishda xatolik.");
  }
  return payload;
}

export async function fetchStatistics() {
  const response = await fetch(`${API_BASE}/api/admin/statistics`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = await toJson(response);
  return payload?.data || { bot: {}, site: {} };
}

export async function fetchDashboardCounts() {
  const response = await fetch(`${API_BASE}/api/admin/dashboard-counts`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = await toJson(response);
  return (
    payload?.data || {
      movies: 0,
      actors: 0,
      banners: 0,
      ads: 0,
      genres: 0,
      trillers: 0,
    }
  );
}
