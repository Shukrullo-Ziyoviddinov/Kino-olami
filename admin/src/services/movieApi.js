const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

async function toJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false || payload?.ok === false) {
    throw new Error(payload?.message || "Server bilan ulanishda xatolik.");
  }
  return payload;
}

export async function fetchMovies() {
  const rows = [];
  let page = 1;
  let hasNext = true;
  let safety = 0;

  while (hasNext && safety < 50) {
    const response = await fetch(`${API_BASE}/api/movies?page=${page}&limit=100`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const payload = await toJson(response);
    rows.push(...(Array.isArray(payload?.data) ? payload.data : []));
    hasNext = Boolean(payload?.meta?.hasNextPage);
    page += 1;
    safety += 1;
  }

  return rows;
}

export async function fetchActorsForMovie() {
  const response = await fetch(`${API_BASE}/api/actors?page=1&limit=100`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = await toJson(response);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createMovie(payload) {
  const response = await fetch(`${API_BASE}/api/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await toJson(response);
  return result?.data;
}
