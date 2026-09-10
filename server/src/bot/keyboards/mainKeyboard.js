const BOT_LANGUAGE_BUTTON_UZ = "🌐 Bot tili";
const BOT_LANGUAGE_BUTTON_RU = "🌐 Язык бота";
const SEARCH_BUTTON_UZ = "🔎 Qidiruv";
const SEARCH_BUTTON_RU = "🔎 Поиск";
const PROFILE_BUTTON_UZ = "👤 Profil";
const PROFILE_BUTTON_RU = "👤 Профиль";
const WISHLIST_BUTTON_UZ = "💾 Saqlanganlar";
const WISHLIST_BUTTON_RU = "💾 Сохраненные";
const { getWebAppUrl } = require("../webAppUrl");

function buildMainReplyKeyboard(language) {
  const isRu = language === "ru";
  const baseUrl = getWebAppUrl();
  return {
    keyboard: [
      [
        { text: isRu ? BOT_LANGUAGE_BUTTON_RU : BOT_LANGUAGE_BUTTON_UZ },
        { text: isRu ? SEARCH_BUTTON_RU : SEARCH_BUTTON_UZ },
      ],
      [
        {
          text: isRu ? PROFILE_BUTTON_RU : PROFILE_BUTTON_UZ,
          web_app: { url: `${baseUrl}/profile` },
        },
        {
          text: isRu ? WISHLIST_BUTTON_RU : WISHLIST_BUTTON_UZ,
          web_app: { url: `${baseUrl}/wishlist` },
        },
      ],
    ],
    resize_keyboard: true,
    persistent: true,
  };
}

function isLanguageButton(text = "") {
  return text === BOT_LANGUAGE_BUTTON_UZ || text === BOT_LANGUAGE_BUTTON_RU;
}

function isSearchButton(text = "") {
  return text === SEARCH_BUTTON_UZ || text === SEARCH_BUTTON_RU;
}

module.exports = {
  buildMainReplyKeyboard,
  isLanguageButton,
  isSearchButton,
};
