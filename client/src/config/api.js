/**
 * API so‘rovlari uchun host prefiksi (oxiridagi / yo‘q).
 *
 * - Vercel (frontend) + Render (API) alohida: Vercelda builddan oldin
 *   REACT_APP_BASE_URL=https://SIZNING-API.onrender.com qo‘ying (oxirida / yo‘q).
 *   Aks holda so‘rovlar Vercelning o‘ziga /api ga ketadi — ma’lumot kelmaydi.
 * - Frontend va backend bir xil Node servisda (masalan, faqat Render): bo‘sh
 *   qoldiring — `/api/...` shu domen bo‘yicha ishlaydi.
 */
export const BASE_URL = (process.env.REACT_APP_BASE_URL || "").replace(/\/$/, "");

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "production" &&
  !process.env.REACT_APP_BASE_URL
) {
  console.warn(
    "[KinoMax] REACT_APP_BASE_URL o‘rnatilmagan. Alohida hostda (masalan Vercel) " +
      "API chaqiruvlari noto‘g‘ri joyga ketadi. Vercel → Project → Settings → " +
      "Environment Variables → REACT_APP_BASE_URL = Render API URL, keyin Redeploy."
  );
}

export const getShareUrl = (path = "") => {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    const base = window.location.origin.replace(/\/$/, "");
    return `${base}${p}`;
  }
  const base = (process.env.REACT_APP_BASE_URL || "").replace(/\/$/, "");
  return base ? `${base}${p}` : p;
};
