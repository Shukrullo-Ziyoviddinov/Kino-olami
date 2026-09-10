const fs = require("fs");
const path = require("path");
const { getMovieByCode, getAllMovies } = require("../../services/movieService");
const {
  getUserLanguage,
  isAwaitingSearch,
  clearAwaitingSearch,
} = require("../../utils/userState");
const { normalizeLanguage, t } = require("../../utils/i18n");
const { sendLanguageSelector } = require("./callbackHandlers");
const { isLanguageButton } = require("../keyboards/mainKeyboard");
const { handleSearchMenu, isSearchMenuButton } = require("./menuHandler");
const {
  hasUserPassedSubscription,
  sendSubscriptionPrompt,
} = require("./subscriptionHandler");
const { getWebAppUrl } = require("../webAppUrl");
const {
  filterMoviesByQuery,
  getMovieDisplayTitle,
} = require("../utils/movieSearch");
const {
  BOT_SEARCH_PICK_PREFIX,
} = require("../keyboards/searchActionsKeyboard");

const clientPublicPath = path.resolve(__dirname, "../../../../client/public");
const telegramVideoCache = new Map();
const DESCRIPTION_MAX_LINES = 5;
const DESCRIPTION_APPROX_LINE_WIDTH = 36;
const DESCRIPTION_PREVIEW_MAX_CHARS =
  DESCRIPTION_MAX_LINES * DESCRIPTION_APPROX_LINE_WIDTH;
const SHARE_BASE_URL = "https://t.me/share/url";

function truncateTextToPreview(text, maxChars) {
  if (!text || typeof text !== "string") {
    return "";
  }

  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxChars) {
    return normalized;
  }

  const slice = normalized.slice(0, maxChars);
  const lastSpaceIndex = slice.lastIndexOf(" ");
  const cutIndex = lastSpaceIndex > maxChars * 0.65 ? lastSpaceIndex : maxChars;
  return `${normalized.slice(0, cutIndex).trimEnd()}...`;
}

function buildCaption(movie, language) {
  const lang = normalizeLanguage(language);
  const title = movie?.title?.[lang] || movie?.title?.uz || movie?.title?.ru || "";
  const localizedDetails =
    movie?.description?.[lang] || movie?.description?.uz || movie?.description?.ru || {};
  const description = truncateTextToPreview(
    localizedDetails?.text || "",
    DESCRIPTION_PREVIEW_MAX_CHARS
  );
  const year = localizedDetails?.year ?? "-";
  const country = localizedDetails?.country || "-";
  const duration = localizedDetails?.duration ?? "-";
  const genres =
    localizedDetails?.genre ||
    movie?.genre?.[lang] ||
    movie?.genre?.uz ||
    movie?.genre?.ru ||
    [];
  const genreText = Array.isArray(genres) && genres.length ? genres.join(", ") : "-";
  const yearLabel = lang === "ru" ? "Год" : "Yil";
  const countryLabel = lang === "ru" ? "Страна" : "Davlat";
  const durationLabel = lang === "ru" ? "Длительность" : "Daqiqa";
  const genreLabel = lang === "ru" ? "Жанр" : "Janr";
  const durationUnit = lang === "ru" ? "мин" : "daqiqa";
  const durationText = duration === "-" ? "-" : `${duration} ${durationUnit}`;

  return [
    title,
    description,
    `📅 ${yearLabel}: ${year}`,
    `🌍 ${countryLabel}: ${country}`,
    `⏱️ ${durationLabel}: ${durationText}`,
    `🎭 ${genreLabel}: ${genreText}`,
    `IMDb: ${movie.ratingImdb ?? "-"}`,
    `Kinopoisk: ${movie.ratingKinopoisk ?? "-"}`,
    `Netflix: ${movie.ratingNetflix ?? "-"}`,
  ].join("\n");
}

const SHARE_TEXT_MAX_CHARS = 3800;

function buildShareText(movie, language, movieTargetUrl) {
  const lang = normalizeLanguage(language);
  const title = movie?.title?.[lang] || movie?.title?.uz || movie?.title?.ru || "";
  const localizedDetails =
    movie?.description?.[lang] || movie?.description?.uz || movie?.description?.ru || {};
  const fullDescription = (localizedDetails?.text || "")
    .replace(/\s+/g, " ")
    .trim();
  const year = localizedDetails?.year ?? "-";
  const country = localizedDetails?.country || "-";
  const duration = localizedDetails?.duration ?? "-";
  const genres =
    localizedDetails?.genre ||
    movie?.genre?.[lang] ||
    movie?.genre?.uz ||
    movie?.genre?.ru ||
    [];
  const genreText = Array.isArray(genres) && genres.length ? genres.join(", ") : "-";
  const yearLabel = lang === "ru" ? "Год" : "Yil";
  const countryLabel = lang === "ru" ? "Страна" : "Davlat";
  const durationLabel = lang === "ru" ? "Длительность" : "Daqiqa";
  const genreLabel = lang === "ru" ? "Жанр" : "Janr";
  const durationUnit = lang === "ru" ? "мин" : "daqiqa";
  const durationText = duration === "-" ? "-" : `${duration} ${durationUnit}`;

  const lines = [
    title,
    fullDescription,
    `📅 ${yearLabel}: ${year}`,
    `🌍 ${countryLabel}: ${country}`,
    `⏱️ ${durationLabel}: ${durationText}`,
    `🎭 ${genreLabel}: ${genreText}`,
    `IMDb: ${movie.ratingImdb ?? "-"}`,
    `Kinopoisk: ${movie.ratingKinopoisk ?? "-"}`,
    `Netflix: ${movie.ratingNetflix ?? "-"}`,
  ];

  const fallbackLang = lang === "ru" ? "uz" : "ru";
  const watchSrc =
    movie?.watchVideo?.[lang] ||
    movie?.watchVideo?.[fallbackLang];
  if (watchSrc) {
    const source = resolveVideoSource(watchSrc);
    if (source?.publicUrl) {
      lines.push(
        lang === "ru"
          ? `🎥 Видео: ${source.publicUrl}`
          : `🎥 Video: ${source.publicUrl}`
      );
    }
  }

  lines.push(
    lang === "ru"
      ? `🔗 Смотреть на сайте: ${movieTargetUrl}`
      : `🔗 Tomosha: ${movieTargetUrl}`
  );

  let text = lines.filter(Boolean).join("\n");
  if (text.length > SHARE_TEXT_MAX_CHARS) {
    text = `${text.slice(0, SHARE_TEXT_MAX_CHARS - 3)}...`;
  }
  return text;
}

function buildMovieInlineKeyboard(movie, language) {
  const movieCode = movie?.movieCode;
  const movieId = movie?.movieId ?? movie?.id;
  const websiteBase = getWebAppUrl();
  const movieTargetUrl = movieId
    ? `${websiteBase}/movie/${movieId}`
    : `${websiteBase}?code=${movieCode}`;
  const shareTarget = movieTargetUrl;
  const shareText = buildShareText(movie, language, movieTargetUrl);
  const shareUrl = `${SHARE_BASE_URL}?url=${encodeURIComponent(
    shareTarget
  )}&text=${encodeURIComponent(shareText)}`;

  return {
    inline_keyboard: [
      [
        {
          text: language === "ru" ? "🎬 Смотреть" : "🎬 Tomosha qilish",
          web_app: { url: movieTargetUrl },
        },
      ],
      [
        {
          text: language === "ru" ? "📤 Поделиться" : "📤 Yuborish",
          url: shareUrl,
        },
      ],
    ],
  };
}

function resolveVideoPath(videoSrc) {
  if (!videoSrc || typeof videoSrc !== "string") {
    return null;
  }

  const normalized = videoSrc.startsWith("/") ? videoSrc.slice(1) : videoSrc;
  return path.join(clientPublicPath, normalized);
}

function resolveVideoSource(videoSrc) {
  if (!videoSrc || typeof videoSrc !== "string") {
    return null;
  }

  if (/^https?:\/\//i.test(videoSrc)) {
    return {
      cacheKey: videoSrc,
      localPath: null,
      publicUrl: videoSrc,
    };
  }

  const normalized = videoSrc.startsWith("/") ? videoSrc : `/${videoSrc}`;
  const websiteBase = getWebAppUrl();

  return {
    cacheKey: normalized,
    localPath: resolveVideoPath(normalized),
    publicUrl: `${websiteBase}${normalized}`,
  };
}

function getCurrentLanguage(msg) {
  const savedLanguage = getUserLanguage(msg?.from?.id);
  if (savedLanguage) {
    return normalizeLanguage(savedLanguage);
  }

  const telegramLanguage = msg?.from?.language_code || "";
  return telegramLanguage.toLowerCase().startsWith("ru") ? "ru" : "uz";
}

function buildSearchStatusMessage(code, language, step = "searching") {
  const isRu = language === "ru";

  if (step === "uploading") {
    return isRu
      ? [
          "🔍 Поиск фильма...",
          `📥 Код: ${code}`,
          "⚙️ Статус: Видео отправляется",
          "🕒 [ ▬▬▬▬▬▬▭▭ ]",
          "━━━━━━━━━━━━━━",
          "💜 Пожалуйста, немного подождите...",
        ].join("\n")
      : [
          "🔍 Kino qidirilmoqda...",
          `📥 Kod: ${code}`,
          "⚙️ Holat: Video yuborilmoqda",
          "🕒 [ ▬▬▬▬▬▬▭▭ ]",
          "━━━━━━━━━━━━━━",
          "💜 Iltimos, biroz kutib turing...",
        ].join("\n");
  }

  return isRu
    ? [
        "🔍 Поиск фильма...",
        `📥 Код: ${code}`,
        "⚙️ Статус: Поиск в базе данных",
        "🕒 [ ▬▬▬▭▭▭▭▭▭ ]",
        "━━━━━━━━━━━━━━",
        "💜 Пожалуйста, немного подождите...",
      ].join("\n")
    : [
        "🔍 Kino qidirilmoqda...",
        `📥 Kod: ${code}`,
        "⚙️ Holat: Ma'lumotlar bazasidan qidirilmoqda",
        "🕒 [ ▬▬▬▭▭▭▭▭▭ ]",
        "━━━━━━━━━━━━━━",
        "💜 Iltimos, biroz kutib turing...",
      ].join("\n");
}

async function sendVideoWithCache(
  bot,
  chatId,
  videoInput,
  cacheKey,
  caption,
  options = {}
) {
  const videoOptions = {
    supports_streaming: true,
    ...options,
  };
  if (caption != null && caption !== "") {
    videoOptions.caption = caption;
  }

  const cachedFileId = telegramVideoCache.get(cacheKey);
  if (cachedFileId) {
    await bot.sendVideo(chatId, cachedFileId, videoOptions);
    return;
  }

  const isLocalPath =
    typeof videoInput === "string" && fs.existsSync(videoInput) && path.isAbsolute(videoInput);
  const fileInput = isLocalPath ? fs.createReadStream(videoInput) : videoInput;
  const fileOptions = isLocalPath
    ? {
        filename: path.basename(videoInput),
        contentType: "video/mp4",
      }
    : undefined;

  const sentMessage = await bot.sendVideo(chatId, fileInput, videoOptions, fileOptions);
  const fileId = sentMessage?.video?.file_id;
  if (fileId) {
    telegramVideoCache.set(cacheKey, fileId);
  }
}

/**
 * Telegramga video yuborishda avvalo mahalliy faylni ishlatamiz (tez va ishonchli).
 * URL orqali yuborishda Telegram serverlari uzoqdan katta faylni yuklab olishi kerak — juda sekin yoki muvaffaqiyatsiz bo‘lishi mumkin.
 */
async function sendVideoFromResolvedSource(bot, chatId, source, caption, options = {}) {
  if (!source) {
    return false;
  }

  if (source.localPath && fs.existsSync(source.localPath)) {
    try {
      await sendVideoWithCache(
        bot,
        chatId,
        source.localPath,
        source.cacheKey,
        caption,
        options
      );
      return true;
    } catch (localError) {
      console.warn("Mahalliy video yuborilmadi, URL sinanadi:", localError.message);
    }
  }

  try {
    await sendVideoWithCache(
      bot,
      chatId,
      source.publicUrl,
      source.cacheKey,
      caption,
      options
    );
    return true;
  } catch (urlError) {
    if (source.localPath && fs.existsSync(source.localPath)) {
      await sendVideoWithCache(
        bot,
        chatId,
        source.localPath,
        source.cacheKey,
        caption,
        options
      );
      return true;
    }
    throw urlError;
  }
}

async function sendPhotoWithCache(
  bot,
  chatId,
  photoInput,
  cacheKey,
  caption,
  options = {}
) {
  const photoOptions = { ...options };
  if (caption != null && caption !== "") {
    photoOptions.caption = caption;
  }

  const cachedFileId = telegramVideoCache.get(`photo:${cacheKey}`);
  if (cachedFileId) {
    await bot.sendPhoto(chatId, cachedFileId, photoOptions);
    return;
  }

  const isLocalPath =
    typeof photoInput === "string" && fs.existsSync(photoInput) && path.isAbsolute(photoInput);
  const fileInput = isLocalPath ? fs.createReadStream(photoInput) : photoInput;
  const fileOptions = isLocalPath
    ? {
        filename: path.basename(photoInput),
        contentType: "image/jpeg",
      }
    : undefined;

  const sentMessage = await bot.sendPhoto(chatId, fileInput, photoOptions, fileOptions);
  const fileId = sentMessage?.photo?.[sentMessage.photo.length - 1]?.file_id;
  if (fileId) {
    telegramVideoCache.set(`photo:${cacheKey}`, fileId);
  }
}

async function sendPhotoFromResolvedSource(bot, chatId, source, caption, options = {}) {
  if (!source) {
    return false;
  }

  if (source.localPath && fs.existsSync(source.localPath)) {
    try {
      await sendPhotoWithCache(
        bot,
        chatId,
        source.localPath,
        source.cacheKey,
        caption,
        options
      );
      return true;
    } catch (localError) {
      console.warn("Mahalliy rasm yuborilmadi, URL sinanadi:", localError.message);
    }
  }

  try {
    await sendPhotoWithCache(
      bot,
      chatId,
      source.publicUrl,
      source.cacheKey,
      caption,
      options
    );
    return true;
  } catch (urlError) {
    if (source.localPath && fs.existsSync(source.localPath)) {
      await sendPhotoWithCache(
        bot,
        chatId,
        source.localPath,
        source.cacheKey,
        caption,
        options
      );
      return true;
    }
    throw urlError;
  }
}

async function sendMovieVideo(bot, chatId, movie, language) {
  const primarySrc =
    movie?.movieMedia?.[language]?.img?.src ||
    movie?.movieMedia?.[language]?.video?.src;
  const fallbackLanguage = language === "ru" ? "uz" : "ru";
  const fallbackSrc =
    movie?.movieMedia?.[fallbackLanguage]?.img?.src ||
    movie?.movieMedia?.[fallbackLanguage]?.video?.src;
  const homeFallback =
    movie?.homeImg?.[language] || movie?.homeImg?.uz || movie?.homeImg?.ru;

  const mediaSrc = primarySrc || fallbackSrc || homeFallback;
  const source = resolveVideoSource(mediaSrc);
  const caption = buildCaption(movie, language);
  const reply_markup = buildMovieInlineKeyboard(movie, language);

  if (!source) {
    await bot.sendMessage(chatId, `${caption}\n\n${t(language, "videoNotFound")}`);
    return;
  }

  await sendPhotoFromResolvedSource(bot, chatId, source, caption, { reply_markup });
}

async function handleTextMovieSearch(bot, chatId, userId, text, language) {
  const query = String(text || "").trim();
  if (!query) {
    await bot.sendMessage(chatId, t(language, "botSearchTypePrompt"));
    return;
  }

  if (/^(bekor|cancel|отмена)$/i.test(query)) {
    clearAwaitingSearch(userId);
    await bot.sendMessage(chatId, t(language, "botSearchCancelled"));
    return;
  }

  // Agar faqat raqam — kod bo'yicha ochish (qidiruv rejimidan chiqamiz)
  if (/^\d+$/.test(query)) {
    clearAwaitingSearch(userId);
    return { asCode: Number(query) };
  }

  const movies = await getAllMovies();
  const matches = filterMoviesByQuery(movies, query, language).slice(0, 10);

  if (!matches.length) {
    await bot.sendMessage(chatId, t(language, "botSearchNoResults", query));
    return;
  }

  clearAwaitingSearch(userId);

  if (matches.length === 1) {
    await bot.sendChatAction(chatId, "upload_photo").catch(() => {});
    await sendMovieVideo(bot, chatId, matches[0], language);
    return;
  }

  const rows = matches.map((movie) => {
    const id = movie.movieId ?? movie.id;
    const title = getMovieDisplayTitle(movie, language);
    const code = movie.movieCode != null ? ` (#${movie.movieCode})` : "";
    const label = `${title}${code}`.slice(0, 64);
    return [
      {
        text: label,
        callback_data: `${BOT_SEARCH_PICK_PREFIX}${id}`,
      },
    ];
  });

  await bot.sendMessage(chatId, t(language, "botSearchResultsHeader", matches.length), {
    reply_markup: { inline_keyboard: rows },
  });
}

async function messageHandler(bot, msg) {
  const chatId = msg?.chat?.id;
  const text = (msg?.text || "").trim();
  const language = getCurrentLanguage(msg);
  const userId = msg?.from?.id;

  if (!chatId) {
    return;
  }

  // Inline qidiruvdan tanlangan natija: to'liq poster kartasini yuboramiz
  if (msg?.via_bot) {
    try {
      const movieIdMatch = String(text || "").match(/\/movie\/(\d+)/);
      const movieId = movieIdMatch ? Number(movieIdMatch[1]) : null;
      if (movieId && Number.isFinite(movieId) && movieId > 0) {
        const Movie = require("../../models/movies");
        const movie = await Movie.findOne({
          $or: [{ movieId }, { id: movieId }],
        })
          .select("-__v")
          .lean();
        if (movie) {
          await bot.sendChatAction(chatId, "upload_photo").catch(() => {});
          await sendMovieVideo(bot, chatId, movie, language);
        }
      }
    } catch (error) {
      console.error("via_bot movie card xatoligi:", error?.message || error);
    }
    return;
  }

  if (isLanguageButton(text)) {
    clearAwaitingSearch(userId);
    await sendLanguageSelector(bot, chatId);
    return;
  }

  const isSubscribed = await hasUserPassedSubscription(bot, userId);
  if (!isSubscribed) {
    clearAwaitingSearch(userId);
    await sendSubscriptionPrompt(bot, chatId, language);
    return;
  }

  if (isSearchMenuButton(text)) {
    clearAwaitingSearch(userId);
    await handleSearchMenu(bot, msg);
    return;
  }

  // Bot orqali qidirish: oddiy chat inputida kino nomi
  if (isAwaitingSearch(userId)) {
    const result = await handleTextMovieSearch(bot, chatId, userId, text, language);
    if (!result?.asCode) {
      return;
    }
    // asCode → pastga kod oqimiga tushadi
    msg = { ...msg, text: String(result.asCode) };
  }

  const codeText = (msg?.text || text || "").trim();
  if (!/^\d+$/.test(codeText)) {
    await bot.sendMessage(chatId, t(language, "askCodeNumber"));
    return;
  }

  const code = Number(codeText);
  let statusMessageId = null;
  try {
    const statusMsg = await bot.sendMessage(
      chatId,
      buildSearchStatusMessage(code, language, "searching")
    );
    statusMessageId = statusMsg?.message_id || null;
  } catch (error) {
    statusMessageId = null;
  }

  const movie = await getMovieByCode(code);

  if (!movie) {
    if (statusMessageId) {
      try {
        await bot.deleteMessage(chatId, statusMessageId);
      } catch (error) {
        // Status xabari o'chmasa ham asosiy oqimni to'xtatmaymiz.
      }
    }
    await bot.sendMessage(chatId, t(language, "movieNotFound", code));
    return;
  }

  try {
    if (statusMessageId) {
      try {
        await bot.editMessageText(buildSearchStatusMessage(code, language, "uploading"), {
          chat_id: chatId,
          message_id: statusMessageId,
        });
      } catch (error) {
        // Edit bo'lmasa ham davom etamiz.
      }
    }
    await bot.sendChatAction(chatId, "upload_photo");
    await sendMovieVideo(bot, chatId, movie, language);
    if (statusMessageId) {
      try {
        await bot.deleteMessage(chatId, statusMessageId);
      } catch (error) {
        // O'chmasa ham davom etamiz.
      }
    }
  } catch (error) {
    console.error("Xabarni qayta ishlashda xatolik:", error.message);
    if (statusMessageId) {
      try {
        await bot.deleteMessage(chatId, statusMessageId);
      } catch (deleteError) {
        // Ignore
      }
    }
    await bot.sendMessage(chatId, t(language, "sendError"));
  }
}

module.exports = {
  messageHandler,
  buildCaption,
  buildMovieInlineKeyboard,
  clientPublicPath,
  resolveVideoSource,
  sendVideoWithCache,
  sendVideoFromResolvedSource,
  getWebAppUrl,
  deliverMovieCard: sendMovieVideo,
};
