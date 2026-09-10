const { t, normalizeLanguage } = require("../../utils/i18n");
const { getUserLanguage } = require("../../utils/userState");
const { buildMainReplyKeyboard, isSearchButton } = require("../keyboards/mainKeyboard");
const { buildSearchActionsKeyboard } = require("../keyboards/searchActionsKeyboard");

function detectUserLanguage(msg) {
  const savedLanguage = getUserLanguage(msg?.from?.id);
  if (savedLanguage) {
    return normalizeLanguage(savedLanguage);
  }

  const telegramLanguage = msg?.from?.language_code || "";
  return telegramLanguage.toLowerCase().startsWith("ru") ? "ru" : "uz";
}

async function sendMainMenu(bot, chatId, language) {
  await bot.sendMessage(chatId, t(language, "menuPrompt"), {
    reply_markup: buildMainReplyKeyboard(language),
  });
}

async function handleSearchMenu(bot, msg) {
  const chatId = msg?.chat?.id;
  if (!chatId) {
    return;
  }

  const language = detectUserLanguage(msg);
  await bot.sendMessage(chatId, t(language, "searchPrompt"), {
    reply_markup: buildSearchActionsKeyboard(language),
  });
}

function isSearchMenuButton(text = "") {
  return isSearchButton(text);
}

module.exports = {
  sendMainMenu,
  handleSearchMenu,
  isSearchMenuButton,
};
