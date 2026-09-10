const MIN_RATING = 5;

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

const isTopRated = (movie = {}) => getMovieMaxRating(movie) > MIN_RATING;

const toGenreList = (movie = {}) => {
  const values = [];

  if (Array.isArray(movie.filterGenre)) {
    values.push(...movie.filterGenre);
  } else if (movie.filterGenre) {
    values.push(movie.filterGenre);
  }

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

  const normalized = values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(normalized)];
};

const getPrimaryGenre = (movie = {}) => {
  const genres = toGenreList(movie);
  if (!genres.length) return "unknown";
  return genres[0];
};

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
      if (!entry.items.length) {
        queue.splice(i, 1);
      } else {
        i += 1;
      }
    }
  }

  return result;
};

const buildTopRatedMovies = (movies = []) => {
  const filtered = [...movies]
    .filter(isTopRated)
    .sort((a, b) => getMovieMaxRating(b) - getMovieMaxRating(a));

  return diversifyByGenre(filtered).map((movie) => ({
    ...movie,
    // Top-rated sahifada userga 10-ballik reyting ko'rinishi uchun.
    rating: getMovieMaxRating(movie),
  }));
};

module.exports = {
  MIN_RATING,
  toNum,
  getMovieMaxRating,
  buildTopRatedMovies,
};
