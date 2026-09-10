const Movie = require("../models/movies");

/**
 * Kino raqamli ID (movieId / id) ni aniqlaydi.
 * String "movie1" kabi qiymatlar rad etiladi.
 */
function resolveMovieNumericId(movie = {}) {
  const candidates = [movie.movieId, movie.id];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

async function getNextMovieId() {
  const last = await Movie.findOne({ movieId: { $type: "number" } })
    .sort({ movieId: -1 })
    .select("movieId")
    .lean();
  const maxId = Number(last?.movieId) || 0;
  return maxId + 1;
}

/**
 * movieId yo'q yoki noto'g'ri bo'lgan kinolarga ketma-ket raqam beradi.
 * Mavjud raqamli movieId larni saqlaydi, id maydonini sync qiladi.
 */
async function ensureMovieNumericIds() {
  const movies = await Movie.find({}).select("_id movieId id").lean();
  if (!movies.length) return { fixed: 0, synced: 0 };

  let maxId = 0;
  for (const row of movies) {
    const n = resolveMovieNumericId(row);
    if (n && n > maxId) maxId = n;
  }

  let fixed = 0;
  let synced = 0;

  for (const row of movies) {
    const current = resolveMovieNumericId(row);
    if (current) {
      if (row.movieId !== current || row.id !== current) {
        await Movie.updateOne(
          { _id: row._id },
          { $set: { movieId: current, id: current } }
        );
        synced += 1;
      }
      continue;
    }

    maxId += 1;
    await Movie.updateOne(
      { _id: row._id },
      { $set: { movieId: maxId, id: maxId } }
    );
    fixed += 1;
  }

  if (fixed || synced) {
    console.log(
      `Movie ID repair: fixed=${fixed}, synced=${synced}, maxId=${maxId}`
    );
  }

  return { fixed, synced, maxId };
}

async function getMovieByCode(code) {
  const numericCode = Number(code);
  if (!Number.isFinite(numericCode)) {
    return null;
  }

  const movie = await Movie.findOne({ movieCode: numericCode }).select("-__v").lean();
  return movie || null;
}

async function getAllMovies() {
  return Movie.find().sort({ movieId: 1 }).select("-__v").lean();
}

module.exports = {
  resolveMovieNumericId,
  getNextMovieId,
  ensureMovieNumericIds,
  getMovieByCode,
  getAllMovies,
};
