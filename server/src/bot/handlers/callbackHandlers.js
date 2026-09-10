const {
  setUserLanguage,
  getUserLanguage,
  setAwaitingSearch,
  clearAwaitingSearch,
} = require("../../utils/userState");
const { normalizeLanguage, t } = require("../../utils/i18n");
const { touchBotUser } = require("./botUserTracker");
const {
  CHECK_SUBSCRIPTION_CALLBACK,
  handleSubscriptionCheck,
  sendSubscriptionPrompt,
  hasUserPassedSubscription,
} = require("./subscriptionHandler");
const {
  BOT_SEARCH_CALLBACK,
  BOT_SEARCH_PICK_PREFIX,
} = require("../keyboards/searchActionsKeyboard");
const Movie = require("../../models/movies");
const { getMovieDisplayTitle } = require("../utils/movieSearch");
const { getWebAppUrl } = require("../webAppUrl");

const LANGUAGE_CALLBACK_PREFIX = "set_lang:";

function buildLanguageKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🇺🇿 UZ", callback_data: `${LANGUAGE_CALLBACK_PREFIX}uz` },
        { text: "🇷🇺 RU", callback_data: `${LANGUAGE_CALLBACK_PREFIX}ru` },
      ],
    ],
  };
}

async function sendLanguageSelector(bot, chatId) {
  await bot.sendMessage(chatId, t("uz", "chooseLanguage"), {
    reply_markup: buildLanguageKeyboard(),
  });
}

async function clearLanguageSelectorMessage(bot, query) {
  const chatId = query?.message?.chat?.id;
  const messageId = query?.message?.message_id;

  if (!chatId || typeof messageId !== "number") {
    return;
  }

  try {
    await bot.deleteMessage(chatId, messageId);
    return;
  } catch (error) {
    console.warn("Til tanlash xabarini o'chirib bo'lmadi:", error.message);
  }

  try {
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    );
  } catch (error) {
    console.warn("Til tanlash tugmalarini o'chirib bo'lmadi:", error.message);
  }
}

async function startBotTextSearch(bot, query, language) {
  const chatId = query?.message?.chat?.id;
  const userId = query?.from?.id;

  await bot.answerCallbackQuery(query.id).catch(() => {});

  if (!chatId || !userId) return;

  const isSubscribed = await hasUserPassedSubscription(bot, userId);
  if (!isSubscribed) {
    await sendSubscriptionPrompt(bot, chatId, language);
    return;
  }

  setAwaitingSearch(userId, true);
  await bot.sendMessage(chatId, t(language, "botSearchTypePrompt"), {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === "ru" ? "❌ Отмена" : "❌ Bekor qilish",
            callback_data: "bot_search:cancel",
          },
        ],
      ],
    },
  });
}

async function handleBotSearchPick(bot, query, language) {
  const chatId = query?.message?.chat?.id;
  const data = query?.data || "";
  const movieId = Number(data.replace(BOT_SEARCH_PICK_PREFIX, ""));

  await bot.answerCallbackQuery(query.id).catch(() => {});

  if (!chatId || !Number.isFinite(movieId) || movieId <= 0) {
    return;
  }

  clearAwaitingSearch(query?.from?.id);

  const movie = await Movie.findOne({
    $or: [{ movieId }, { id: movieId }],
  })
    .select("-__v")
    .lean();

  if (!movie) {
    await bot.sendMessage(chatId, t(language, "botSearchNotFound"));
    return;
  }

  try {
    const messageHandler = require("./messageHandler");
    if (typeof messageHandler.deliverMovieCard === "function") {
      await bot.sendChatAction(chatId, "upload_photo").catch(() => {});
      await messageHandler.deliverMovieCard(bot, chatId, movie, language);
      return;
    }
  } catch (error) {
    console.warn("Kino kartasini yuborishda xatolik:", error?.message || error);
  }

  const title = getMovieDisplayTitle(movie, language);
  const code = movie.movieCode;
  const id = movie.movieId ?? movie.id;
  const movieUrl = id
    ? `${getWebAppUrl()}/movie/${id}`
    : `${getWebAppUrl()}/?code=${code}`;

  const text =
    language === "ru"
      ? `🎬 ${title}\nКод: ${code ?? "—"}`
      : `🎬 ${title}\nKod: ${code ?? "—"}`;

  await bot.sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: language === "ru" ? "🎬 Смотреть" : "🎬 Tomosha qilish",
            web_app: { url: movieUrl },
          },
        ],
      ],
    },
  });
}

async function callbackHandler(bot, query) {
  const callbackData = query?.data || "";
  const userId = query?.from?.id;
  const chatId = query?.message?.chat?.id;
  const language = normalizeLanguage(getUserLanguage(userId) || "uz");

  if (callbackData === CHECK_SUBSCRIPTION_CALLBACK) {
    await handleSubscriptionCheck(bot, query, language);
    return;
  }

  if (callbackData === BOT_SEARCH_CALLBACK) {
    await startBotTextSearch(bot, query, language);
    return;
  }

  if (callbackData === "bot_search:cancel") {
    clearAwaitingSearch(userId);
    await bot
      .answerCallbackQuery(query.id, {
        text: language === "ru" ? "Поиск отменён" : "Qidiruv bekor qilindi",
      })
      .catch(() => {});
    if (chatId) {
      await bot.sendMessage(chatId, t(language, "botSearchCancelled"));
    }
    return;
  }

  if (callbackData.startsWith(BOT_SEARCH_PICK_PREFIX)) {
    await handleBotSearchPick(bot, query, language);
    return;
  }

  if (!callbackData.startsWith(LANGUAGE_CALLBACK_PREFIX)) {
    return;
  }

  const selected = callbackData.replace(LANGUAGE_CALLBACK_PREFIX, "");
  const nextLanguage = normalizeLanguage(selected);
  setUserLanguage(userId, nextLanguage);
  try {
    await touchBotUser(
      {
        from: query?.from,
        chat: query?.message?.chat,
      },
      nextLanguage
    );
  } catch (_error) {
    // tracking xatoliklari asosiy oqimni to'xtatmasin
  }

  await bot.answerCallbackQuery(query.id, {
    text: t(nextLanguage, "languageSaved"),
  });

  if (chatId) {
    await clearLanguageSelectorMessage(bot, query);
    await sendSubscriptionPrompt(bot, chatId, nextLanguage);
  }
}

module.exports = {
  callbackHandler,
  sendLanguageSelector,
};
