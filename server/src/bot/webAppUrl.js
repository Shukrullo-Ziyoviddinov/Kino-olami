/**
 * Telegram Mini App / client sayt bazaviy URL.
 * Railway/Render env: WEB_APP_URL=https://www.chosontv.uz
 */
function getWebAppUrl() {
  const raw = String(
    process.env.WEB_APP_URL ||
      process.env.CLIENT_URL ||
      process.env.SITE_URL ||
      "https://www.chosontv.uz"
  ).trim();
  return raw.replace(/\/+$/, "") || "https://www.chosontv.uz";
}

module.exports = {
  getWebAppUrl,
};
