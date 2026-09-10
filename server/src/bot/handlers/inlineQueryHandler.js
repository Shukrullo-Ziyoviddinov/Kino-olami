const { getAllMovies } = require("../../services/movieService");
const { getUserLanguage } = require("../../utils/userState");
const { normalizeLanguage } = require("../../utils/i18n");
const { getWebAppUrl } = require("../webAppUrl");

let moviesCache = { at: 0, items: [] };
const MOVIES_CACHE_MS = 60 * 1000;

async function getMoviesCached() {
  const now = Date.now();
  if (moviesCache.items.length && now - moviesCache.at < MOVIES_CACHE_MS) {
    return moviesCache.items;
  }
  const items = await getAllMovies();
  moviesCache = { at: now, items: Array.isArray(items) ? items : [] };
  return moviesCache.items;
}

function resolveLanguage(query) {
  const savedLanguage = getUserLanguage(query?.from?.id);
  if (savedLanguage) {
    return normalizeLanguage(savedLanguage);
  }

  const telegramLanguage = query?.from?.language_code || "";
  return telegramLanguage.toLowerCase().startsWith("ru") ? "ru" : "uz";
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function fuzzyMatch(queryWord, targetWord) {
  if (!queryWord || !targetWord || queryWord.length < 2) {
    return false;
  }

  if (targetWord.includes(queryWord) || queryWord.includes(targetWord)) {
    return true;
  }

  if (queryWord.length >= 3 && targetWord.length >= 3) {
    const distance = levenshtein(queryWord, targetWord);
    const maxDistance =
      queryWord.length <= 4 ? 1 : Math.min(2, Math.floor(queryWord.length / 2));
    return distance <= maxDistance;
  }

  return false;
}

function titleMatchScore(movie, q, queryWords) {
  const titleUz = normalize(movie?.title?.uz);
  const titleRu = normalize(movie?.title?.ru);

  if (titleUz.includes(q) || titleRu.includes(q)) {
    return 3;
  }

  const titleWords = `${titleUz} ${titleRu}`.split(/\s+/).filter(Boolean);
  for (const queryWord of queryWords) {
    if (queryWord.length < 2) {
      continue;
    }

    if (titleWords.some((word) => fuzzyMatch(queryWord, word))) {
      return 2;
    }
  }

  return 0;
}

function metaMatchScore(movie, language, queryWords) {
  const details =
    movie?.description?.[language] || movie?.description?.uz || movie?.description?.ru || {};
  const genres =
    details?.genre ||
    movie?.genre?.[language] ||
    movie?.genre?.uz ||
    movie?.genre?.ru ||
    [];

  const haystackItems = [
    movie?.movieCode,
    details?.country,
    details?.year,
    details?.duration,
    ...(Array.isArray(genres) ? genres : [genres]),
  ]
    .filter(Boolean)
    .map((item) => normalize(item));

  let hits = 0;
  for (const queryWord of queryWords) {
    if (queryWord.length < 2) {
      continue;
    }

    if (haystackItems.some((item) => fuzzyMatch(queryWord, item) || item.includes(queryWord))) {
      hits += 1;
    }
  }

  return hits > 0 ? 1 : 0;
}

function buildMovieSummary(movie, language) {
  const details =
    movie?.description?.[language] || movie?.description?.uz || movie?.description?.ru || {};
  const genres =
    details?.genre ||
    movie?.genre?.[language] ||
    movie?.genre?.uz ||
    movie?.genre?.ru ||
    [];
  const genreText = Array.isArray(genres) && genres.length ? genres.join(", ") : "-";
  const year = details?.year ?? "-";
  const country = details?.country || "-";
  const duration = details?.duration ?? "-";
  const durationUnit = language === "ru" ? "мин" : "daqiqa";

  return `${year} • ${country} • ${duration} ${durationUnit}\n${genreText}`;
}

function toAbsoluteAssetUrl(assetPath) {
  if (!assetPath || typeof assetPath !== "string") {
    return null;
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const base = getWebAppUrl();
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${base}${normalizedPath}`;
}

function toSafeThumbnailUrl(assetPath) {
  const url = toAbsoluteAssetUrl(assetPath);
  if (!url || !/^https:\/\//i.test(url)) return null;
  if (url.length > 1800) return null;
  return url;
}

function filterMovies(movies, queryText, language) {
  const needle = normalize(queryText);
  const onlySymbols = !/[a-zA-Z0-9\u0400-\u04FF\u0600-\u06FF]/.test(needle);
  if (!needle || needle === "*" || needle === "." || onlySymbols) {
    return movies;
  }

  const queryWords = needle.split(/\s+/).filter(Boolean);
  const scored = [];

  for (const movie of movies) {
    const titleScore = titleMatchScore(movie, needle, queryWords);
    const metaScore = metaMatchScore(movie, language, queryWords);
    const totalScore = titleScore + metaScore;

    if (totalScore > 0) {
      scored.push({ movie, totalScore });
    }
  }

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored.map((item) => item.movie);
}

function getMoviePosterUrl(movie, language) {
  const candidates = [
    movie?.homeImg?.[language],
    movie?.homeImg?.uz,
    movie?.homeImg?.ru,
    movie?.movieMedia?.[language]?.img?.src,
    movie?.movieMedia?.uz?.img?.src,
    movie?.movieMedia?.ru?.img?.src,
  ];
  for (const raw of candidates) {
    const url = toSafeThumbnailUrl(raw);
    if (url) return url;
  }
  return null;
}

/**
 * Ro'yxat: kichik thumb + nom + tavsif.
 * Chat: poster URL (preview) + matnlar + Tomosha tugmasi.
 * (chosen_inline_result BotFather Feedback talab qiladi — ishonchli emas)
 */
function mapInlineResult(movie, language, uniqueSuffix = 0) {
  const title = movie?.title?.[language] || movie?.title?.uz || movie?.title?.ru || "Untitled";
  const movieId = movie?.movieId ?? movie?.id;
  const movieCode = movie?.movieCode;
  const base = getWebAppUrl();
  const movieUrl = movieId ? `${base}/movie/${movieId}` : `${base}/?code=${movieCode}`;
  const summary = buildMovieSummary(movie, language);
  const posterUrl = getMoviePosterUrl(movie, language);
  const codeLine =
    movieCode != null
      ? language === "ru"
        ? `Код: ${movieCode}`
        : `Kod: ${movieCode}`
      : "";

  const resultId = `m${movieId || movieCode || 0}-${uniqueSuffix}`.slice(0, 64);

  const watchButton = {
    text: language === "ru" ? "🎬 Смотреть" : "🎬 Tomosha qilish",
    url: movieUrl,
  };

  const textBody = [title, codeLine, movieUrl].filter(Boolean).join("\n");

  return {
    type: "article",
    id: resultId,
    title: String(title).slice(0, 64),
    description: [codeLine, String(summary).replace(/\n/g, " • ")]
      .filter(Boolean)
      .join(" • ")
      .slice(0, 120),
    ...(posterUrl
      ? {
          thumbnail_url: posterUrl,
          thumb_url: posterUrl,
          thumbnail_width: 48,
          thumbnail_height: 64,
          thumb_width: 48,
          thumb_height: 64,
        }
      : {}),
    // Qisqa matn (movie URL bilan) — to'liq rasm via_bot handler yuboradi
    input_message_content: {
      message_text: `🎬 ${textBody}`.slice(0, 4096),
      disable_web_page_preview: true,
    },
    reply_markup: {
      inline_keyboard: [[watchButton]],
    },
  };
}

async function inlineQueryHandler(bot, query) {
  const queryId = query?.id;
  if (!queryId) return;

  const language = resolveLanguage(query);
  const queryText = (query?.query || "").trim();
  const offset = Number.parseInt(query?.offset || "0", 10) || 0;
  const pageSize = 20;

  let movies = [];
  try {
    movies = await getMoviesCached();
  } catch (error) {
    console.error("inline getAllMovies xatoligi:", error?.message || error);
  }

  const filtered = filterMovies(movies, queryText, language);
  const page = filtered.slice(offset, offset + pageSize);
  let results = page.map((movie, index) =>
    mapInlineResult(movie, language, offset + index)
  );

  if (!results.length && offset === 0) {
    results = [
      {
        type: "article",
        id: "empty-0",
        title:
          language === "ru" ? "Ничего не найдено" : "Hech narsa topilmadi",
        description: queryText
          ? language === "ru"
            ? `Запрос: ${queryText}`
            : `So‘rov: ${queryText}`
          : language === "ru"
            ? "Введите название фильма"
            : "Kino nomini yozing",
        input_message_content: {
          message_text:
            language === "ru"
              ? `По запросу «${queryText || "…"}» фильм не найден.`
              : `«${queryText || "…"}» bo‘yicha kino topilmadi.`,
          disable_web_page_preview: true,
        },
      },
    ];
  }

  const nextOffset =
    offset + pageSize < filtered.length ? String(offset + pageSize) : "";

  try {
    await bot.answerInlineQuery(queryId, results, {
      cache_time: 1,
      is_personal: true,
      next_offset: nextOffset,
    });
    console.log(
      `inline_query answered: q="${queryText}" results=${results.length} movies=${movies.length}`
    );
  } catch (error) {
    console.error(
      "Inline query xatoligi:",
      error?.response?.body || error?.message || error
    );
    try {
      await bot.answerInlineQuery(
        queryId,
        [
          {
            type: "article",
            id: "err-0",
            title: "Xatolik / Ошибка",
            description: "Qayta urinib ko‘ring",
            input_message_content: {
              message_text: "Inline qidiruvda xatolik. /search dan foydalaning.",
            },
          },
        ],
        {
          cache_time: 0,
          is_personal: true,
        }
      );
    } catch (_e) {
      // ignore
    }
  }
}

module.exports = {
  inlineQueryHandler,
};
