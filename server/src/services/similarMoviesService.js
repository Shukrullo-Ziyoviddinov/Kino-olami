const normalizeString = (value) => String(value || "").trim().toLowerCase();

const normalizeToArray = (value) => {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => normalizeString(item)).filter(Boolean))];
  }
  const next = normalizeString(value);
  return next ? [next] : [];
};

const hasCommonValue = (left = [], right = []) => {
  if (!left.length || !right.length) return false;
  const rightSet = new Set(right);
  return left.some((item) => rightSet.has(item));
};

const { normalizeMovieMediaFields } = require("../utils/mediaUrl");
const { resolveMovieNumericId } = require("./movieService");

const toPublicMovie = (row = {}) => {
  const { _id, movieId, createdAt, updatedAt, ...movie } = row;
  const id = resolveMovieNumericId({ movieId, id: movie.id });
  return normalizeMovieMediaFields({
    ...movie,
    movieId: id,
    id,
  });
};

const buildSimilarMovies = ({ currentMovie, candidates = [] }) => {
  const currentTypeCategory = normalizeToArray(currentMovie?.typeCategory);
  const currentFilterCountry = normalizeString(currentMovie?.filterCountry);
  const currentId = currentMovie?.id;

  return candidates.filter((movie) => {
    if (movie?.id === currentId) return false;

    const movieTypeCategory = normalizeToArray(movie?.typeCategory);
    const movieFilterCountry = normalizeString(movie?.filterCountry);

    if (!movieTypeCategory.length && !movieFilterCountry) return false;

    const hasMatchingTypeCategory = hasCommonValue(currentTypeCategory, movieTypeCategory);
    const hasMatchingFilterCountry =
      Boolean(currentFilterCountry) &&
      Boolean(movieFilterCountry) &&
      currentFilterCountry === movieFilterCountry;

    return hasMatchingTypeCategory || hasMatchingFilterCountry;
  });
};

module.exports = {
  toPublicMovie,
  buildSimilarMovies,
};
