/** Cold start: 4 eng yangi + 3 eng yuqori reyting = 7 (Home preview bilan mos). */
const COLD_START_TOTAL = 7;
const COLD_START_NEWEST = 4;
const COLD_START_TOP_RATED = 3;

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const normalizeToArray = (value) => {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => normalizeText(item)).filter(Boolean))];
  }
  const normalized = normalizeText(value);
  return normalized ? [normalized] : [];
};

const recommendationKey = (movie) => {
  const title =
    normalizeText(movie?.title?.uz) ||
    normalizeText(movie?.title?.ru) ||
    normalizeText(movie?.title);
  const year = normalizeText(
    movie?.description?.uz?.year || movie?.description?.ru?.year || movie?.specs?.year
  );
  const image = normalizeText(movie?.homeImg?.uz || movie?.homeImg?.ru);
  return `${title}|${year}|${image}`;
};

const uniqueRecommendations = (items = []) => {
  const used = new Set();
  const result = [];
  items.forEach((movie) => {
    const key = recommendationKey(movie);
    if (!key || used.has(key)) return;
    used.add(key);
    result.push(movie);
  });
  return result;
};

const parseRating = (value, max) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.min(num / max, 1);
};

const getQualityScore = (movie) => {
  const rating = parseRating(movie?.rating, 5);
  const imdb = parseRating(movie?.ratingImdb, 10);
  const kinopoisk = parseRating(movie?.ratingKinopoisk, 10);
  const netflix = parseRating(movie?.ratingNetflix, 5);
  const values = [rating, imdb, kinopoisk, netflix].filter((v) => v !== null);
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

/** Prefer filterGenre; fallback to localized genre labels. */
const getMovieFilterGenres = (movie) => {
  if (movie?.filterGenre != null && movie.filterGenre !== "") {
    return normalizeToArray(movie.filterGenre);
  }
  const source = movie?.genre;
  if (!source) return [];
  if (Array.isArray(source)) return normalizeToArray(source);
  if (typeof source === "object") {
    return normalizeToArray([...(source.uz || []), ...(source.ru || [])]);
  }
  return normalizeToArray(source);
};

const getMovieFilterCountry = (movie) => normalizeText(movie?.filterCountry);

const getMovieCreatedAtMs = (movie) => {
  if (movie?.createdAt) {
    const ms = new Date(movie.createdAt).getTime();
    if (Number.isFinite(ms)) return ms;
  }
  const id = Number(movie?.id);
  return Number.isFinite(id) ? id : 0;
};

const addWeight = (map, key, inc) => {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + inc);
};

/**
 * Foydalanuvchi ko'rgan kinolardan janr / davlat og'irliklari.
 * Qancha ko'p (viewCount) ko'rilgan bo'lsa — shuncha yuqori weight.
 */
const buildViewProfile = (movies = [], user = null) => {
  const movieById = new Map(movies.map((movie) => [Number(movie?.id), movie]));
  const viewedEntries = Array.isArray(user?.viewedMovies) ? user.viewedMovies : [];

  const viewedIds = new Set();
  const genreWeights = new Map();
  const countryWeights = new Map();

  viewedEntries.forEach((entry) => {
    const movieId = Number(entry?.movieId);
    if (!Number.isFinite(movieId)) return;
    const movie = movieById.get(movieId);
    if (!movie) return;

    viewedIds.add(movieId);
    const weight = Math.max(1, Number(entry?.viewCount) || 1);

    getMovieFilterGenres(movie).forEach((genre) => addWeight(genreWeights, genre, weight));
    const country = getMovieFilterCountry(movie);
    if (country) addWeight(countryWeights, country, weight);
  });

  return {
    viewedIds,
    genreWeights,
    countryWeights,
    hasViewed: viewedIds.size > 0,
  };
};

/**
 * Mos keladi: kamida 1 janr OR bir xil filterCountry.
 * Ball: mos janr weight'lari + davlat weight; ikkalasi ham mos bo'lsa qo'shimcha bonus.
 */
const scoreByGenreAndCountry = (movie, profile) => {
  const movieGenres = getMovieFilterGenres(movie);
  const movieCountry = getMovieFilterCountry(movie);

  let genreScore = 0;
  let matchedGenreCount = 0;
  movieGenres.forEach((genre) => {
    const w = profile.genreWeights.get(genre) || 0;
    if (w > 0) {
      genreScore += w;
      matchedGenreCount += 1;
    }
  });

  const countryWeight = movieCountry ? profile.countryWeights.get(movieCountry) || 0 : 0;
  const countryMatch = countryWeight > 0;
  const genreMatch = matchedGenreCount > 0;

  if (!genreMatch && !countryMatch) return null;

  // Ikkala signal birga — yuqoriroq (masalan: drama+jangari + turkiya ko'p ko'rilgan)
  const bothBonus = genreMatch && countryMatch ? Math.min(genreScore, countryWeight || genreScore) * 0.5 : 0;

  return genreScore + countryWeight + bothBonus + matchedGenreCount * 0.01;
};

/**
 * Yangi user / ko'rmagan: 4 eng oxirgi joylangan + 3 eng yuqori reyting.
 */
const buildColdStartRecommendations = (movies = []) => {
  const unique = uniqueRecommendations(movies);
  if (!unique.length) return [];

  const byNewest = [...unique].sort((a, b) => getMovieCreatedAtMs(b) - getMovieCreatedAtMs(a));
  const newest = byNewest.slice(0, COLD_START_NEWEST);
  const newestIds = new Set(newest.map((m) => Number(m.id)));

  const byRating = [...unique]
    .filter((m) => !newestIds.has(Number(m.id)))
    .sort((a, b) => getQualityScore(b) - getQualityScore(a));
  const topRated = byRating.slice(0, COLD_START_TOP_RATED);

  return uniqueRecommendations([...newest, ...topRated]).slice(0, COLD_START_TOTAL);
};

const buildPersonalizedRecommendations = ({
  movies = [],
  user = null,
} = {}) => {
  const visibleMovies = movies.filter((movie) => normalizeText(movie?.category) !== "anonslar");

  if (!user) {
    return buildColdStartRecommendations(visibleMovies);
  }

  const profile = buildViewProfile(visibleMovies, user);
  if (!profile.hasViewed) {
    return buildColdStartRecommendations(visibleMovies);
  }

  const candidates = visibleMovies.filter((movie) => !profile.viewedIds.has(Number(movie?.id)));

  const scored = candidates
    .map((movie) => {
      const score = scoreByGenreAndCountry(movie, profile);
      return score == null ? null : { movie, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.movie);

  // Limit yo'q — barcha mos janr / davlat kinolari
  return uniqueRecommendations(scored);
};

module.exports = {
  buildPersonalizedRecommendations,
  uniqueRecommendations,
  COLD_START_TOTAL,
  /** @deprecated Aliases for older imports — cold-start size, not a hard catalog cap. */
  RECOMMENDED_LIMIT: COLD_START_TOTAL,
};
