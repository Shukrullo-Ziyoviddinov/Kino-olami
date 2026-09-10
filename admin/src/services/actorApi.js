const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

async function toJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false || payload?.ok === false) {
    throw new Error(payload?.message || "Server bilan ulanishda xatolik.");
  }
  return payload;
}

async function fetchAllPages(endpoint, limit = 100) {
  const rows = [];
  let page = 1;
  let hasNext = true;
  let safety = 0;

  while (hasNext && safety < 50) {
    const response = await fetch(`${API_BASE}${endpoint}?page=${page}&limit=${limit}`, {
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

export async function fetchActors() {
  return fetchAllPages("/api/actors");
}

export async function fetchNextActorId() {
  const response = await fetch(`${API_BASE}/api/actors/next-id`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = await toJson(response);
  return Number(payload?.data?.nextActorId);
}

export async function createActor(payload) {
  const response = await fetch(`${API_BASE}/api/actors`, {
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
