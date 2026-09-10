const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

export async function adminLogin({ firstName, lastName, password }) {
  const response = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, password }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.ok) {
    const msg = json.message || "Kirish muvaffaqiyatsiz";
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }
  return json.data;
}

export async function fetchAdminProfile() {
  const response = await fetch(`${API_BASE}/api/admin/profile`);
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.ok) return null;
  return json.data;
}
