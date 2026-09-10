/**
 * `media.chosontv.uz/...` → `https://media.chosontv.uz/...`
 */
export function normalizeMediaUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^(https?:|data:|blob:)/i.test(raw)) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}([/:?]|$)/i.test(raw)) {
    return `https://${raw}`;
  }

  return raw;
}
