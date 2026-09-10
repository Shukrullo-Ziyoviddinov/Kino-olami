const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

async function toJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false || payload?.ok === false) {
    throw new Error(payload?.message || "Server bilan ulanishda xatolik.");
  }
  return payload;
}

export async function fetchSocialLinks() {
  const response = await fetch(`${API_BASE}/api/social-links`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = await toJson(response);
  return payload?.data || { social: {}, appStore: {}, contact: {}, subscription: {} };
}

export async function saveSocialLinks(type, items) {
  const response = await fetch(`${API_BASE}/api/social-links/${type}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ items }),
  });
  const payload = await toJson(response);
  return payload?.data || [];
}
