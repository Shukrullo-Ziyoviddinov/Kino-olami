const { getWebAppUrl } = require("../webAppUrl");

const BOT_SEARCH_CALLBACK = "bot_search:start";
const BOT_SEARCH_PICK_PREFIX = "bot_search:pick:";

function buildSearchActionsKeyboard(language) {
  const isRu = language === "ru";
  const baseUrl = getWebAppUrl();
  const searchUrl = `${baseUrl}/?openSearch=1&source=telegram`;

  return {
    inline_keyboard: [
      [
        {
          // Klassik @bot qidiruv (inputda @ChosonTV_bot ...)
          text: isRu ? "🤖 Поиск в чате (@bot)" : "🤖 Bot ichida qidirish (@bot)",
          // Bo'sh string o'rniga nuqta — ba'zi klientlarda inline ishonchliroq ochiladi
          switch_inline_query_current_chat: ".",
        },
      ],
      [
        {
          text: isRu ? "✍️ Писать название в чат" : "✍️ Chatga nom yozib qidirish",
          callback_data: BOT_SEARCH_CALLBACK,
        },
      ],
      [
        {
          text: isRu ? "📱 Поиск через приложение" : "📱 Ilova orqali qidirish",
          web_app: { url: searchUrl },
        },
      ],
    ],
  };
}

module.exports = {
  buildSearchActionsKeyboard,
  BOT_SEARCH_CALLBACK,
  BOT_SEARCH_PICK_PREFIX,
};
