/**
 * Yuqori reytingli kinolar — dinamik Top-N.
 *
 * Algoritm (har so‘rovda qayta hisoblanadi):
 * 1) score = max(IMDb, Kinopoisk, Netflix)
 * 2) score >= MIN_RATING
 * 3) sort: score DESC, createdAt DESC, id ASC
 * 4) janr diversifikatsiya (ixtiyoriy yumshoq aralash)
 * 5) hard cap: TOP_RATED_LIMIT (30)
 */

const MIN_RATING = 7;
const TOP_RATED_LIMIT = 30;

const toNum = (value) => {
  if (value == null || value === "" || value === "none") return 0;
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
};

const getMovieMaxRating = (movie = {}) =>
  Math.max(
    toNum(movie.ratingImdb),
    toNum(movie.ratingKinopoisk),
    toNum(movie.ratingNetflix)
  );

const getCreatedAtMs = (movie = {}) => {
  const parsed = Date.parse(movie.createdAt || movie.updatedAt || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getStableId = (movie = {}) => {
  const id = Number(movie.id ?? movie.movieId);
  return Number.isFinite(id) ? id : 0;
};

const isTopRatedCandidate = (movie = {}) => getMovieMaxRating(movie) >= MIN_RATING;

const compareTopRated = (a, b) => {
  const scoreDiff = getMovieMaxRating(b) - getMovieMaxRating(a);
  if (scoreDiff !== 0) return scoreDiff;

  const createdDiff = getCreatedAtMs(b) - getCreatedAtMs(a);
  if (createdDiff !== 0) return createdDiff;

  return getStableId(a) - getStableId(b);
};

const toGenreList = (movie = {}) => {
  const values = [];

  if (Array.isArray(movie.filterGenre)) values.push(...movie.filterGenre);
  else if (movie.filterGenre) values.push(movie.filterGenre);

  if (Array.isArray(movie.genre)) {
    values.push(...movie.genre);
  } else if (movie.genre && typeof movie.genre === "object") {
    Object.values(movie.genre).forEach((item) => {
      if (Array.isArray(item)) values.push(...item);
      else if (item) values.push(item);
    });
  } else if (movie.genre) {
    values.push(movie.genre);
  }

  return [
    ...new Set(
      values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value || "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
};

const getPrimaryGenre = (movie = {}) => toGenreList(movie)[0] || "unknown";

/** Round-robin by primary genre (queues already score-sorted). */
const diversifyByGenre = (movies = []) => {
  const grouped = new Map();

  movies.forEach((movie) => {
    const key = getPrimaryGenre(movie);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(movie);
  });

  const queue = [...grouped.entries()]
    .map(([genre, items]) => ({
      genre,
      items,
      topScore: getMovieMaxRating(items[0]),
    }))
    .sort((a, b) => b.topScore - a.topScore);

  const result = [];
  while (queue.length) {
    for (let i = 0; i < queue.length; ) {
      const entry = queue[i];
      const item = entry.items.shift();
      if (item) result.push(item);
      if (!entry.items.length) queue.splice(i, 1);
      else i += 1;
    }
  }

  return result;
};

/**
 * @param {Array} movies
 * @param {{ limit?: number }} [options]
 * @returns {Array}
 */
const buildTopRatedMovies = (movies = [], options = {}) => {
  const hardLimit = Math.min(
    Math.max(1, Number(options.limit) || TOP_RATED_LIMIT),
    TOP_RATED_LIMIT
  );

  const ranked = diversifyByGenre(
    [...movies].filter(isTopRatedCandidate).sort(compareTopRated)
  )
    .slice(0, hardLimit)
    .map((movie) => ({
      ...movie,
      rating: getMovieMaxRating(movie),
    }));

  return ranked;
};

/**
 * Top-rated ro‘yxatini sahifalash (jami hech qachon TOP_RATED_LIMIT dan oshmaydi).
 * @returns {{ items: Array, totalItems: number }}
 */
const paginateTopRatedMovies = (movies = [], { skip = 0, limit = 20 } = {}) => {
  const ranked = buildTopRatedMovies(movies);
  const safeSkip = Math.max(0, Number(skip) || 0);
  const safeLimit = Math.max(1, Number(limit) || 20);

  return {
    items: ranked.slice(safeSkip, safeSkip + safeLimit),
    totalItems: ranked.length,
  };
};

module.exports = {
  MIN_RATING,
  TOP_RATED_LIMIT,
  toNum,
  getMovieMaxRating,
  buildTopRatedMovies,
  paginateTopRatedMovies,
};
