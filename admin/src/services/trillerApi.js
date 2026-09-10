const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

async function toJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false || payload?.ok === false) {
    throw new Error(payload?.message || "Server bilan ulanishda xatolik.");
  }
  return payload;
}

export async function fetchTrillers() {
  const response = await fetch(`${API_BASE}/api/trillers?page=1&limit=200`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = await toJson(response);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createTriller(payload) {
  const response = await fetch(`${API_BASE}/api/trillers`, {
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

export async function updateTriller(trillerId, payload) {
  const response = await fetch(`${API_BASE}/api/trillers/${trillerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await toJson(response);
  return result?.data;
}

export async function deleteTriller(trillerId) {
  const response = await fetch(`${API_BASE}/api/trillers/${trillerId}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  await toJson(response);
}
