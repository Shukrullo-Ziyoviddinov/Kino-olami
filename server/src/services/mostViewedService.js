/**
 * Eng ko'p ko'rilgan kinolar (all-time Top-N).
 * - metrika: uniqueUsers DESC → totalViews DESC → movieId ASC
 * - hard cap: MAX_MOST_VIEWED (20)
 * - har so'rovda qayta hisoblanadi
 */

const Movie = require("../models/movies");
const {
  MAX_MOST_VIEWED,
  getMostViewedRows,
} = require("../utils/movieViews");
const { resolveMovieNumericId } = require("./movieService");
const { normalizeMovieMediaFields } = require("../utils/mediaUrl");

const MIN_UNIQUE_USERS = 1;

const toPublicMovie = (row) => {
  if (!row) return null;
  const { _id, movieId, createdAt, updatedAt, __v, ...movie } = row;
  const id = resolveMovieNumericId({ movieId, id: movie.id });
  if (!id) return null;

  return normalizeMovieMediaFields({
    ...movie,
    movieId: id,
    id,
  });
};

const loadMoviesByIds = async (ids = []) => {
  if (!ids.length) return new Map();

  const rows = await Movie.find({
    $or: [{ movieId: { $in: ids } }, { id: { $in: ids } }],
  })
    .select("-__v")
    .lean();

  const byId = new Map();
  rows.forEach((row) => {
    const id = resolveMovieNumericId(row);
    if (id) byId.set(id, row);
  });
  return byId;
};

/**
 * @param {{ limit?: number, minUniqueUsers?: number }} [options]
 * @returns {Promise<{ items: Array, meta: object }>}
 */
const buildMostViewedMovies = async ({
  limit = MAX_MOST_VIEWED,
  minUniqueUsers = MIN_UNIQUE_USERS,
} = {}) => {
  const safeLimit = Math.min(
    Math.max(1, Number(limit) || MAX_MOST_VIEWED),
    MAX_MOST_VIEWED
  );
  const safeMin = Math.max(1, Number(minUniqueUsers) || MIN_UNIQUE_USERS);

  const ranked = await getMostViewedRows({
    limit: safeLimit,
    minUniqueUsers: safeMin,
  });

  if (!ranked.length) {
    return {
      items: [],
      meta: {
        minUniqueUsers: safeMin,
        limit: safeLimit,
        maxItems: MAX_MOST_VIEWED,
        totalItems: 0,
      },
    };
  }

  const byId = await loadMoviesByIds(ranked.map((row) => row.movieId));

  const items = ranked
    .map((entry) => {
      const movie = toPublicMovie(byId.get(entry.movieId));
      if (!movie) return null;

      return {
        ...movie,
        uniqueUsers: entry.uniqueUsers,
        totalViews: entry.totalViews,
      };
    })
    .filter(Boolean)
    .map((movie, index) => ({
      ...movie,
      rank: index + 1,
    }));

  return {
    items,
    meta: {
      minUniqueUsers: safeMin,
      limit: safeLimit,
      maxItems: MAX_MOST_VIEWED,
      totalItems: items.length,
    },
  };
};

module.exports = {
  MIN_UNIQUE_USERS,
  MAX_MOST_VIEWED,
  buildMostViewedMovies,
};
