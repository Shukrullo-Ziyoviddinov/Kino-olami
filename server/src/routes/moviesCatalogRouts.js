const express = require("express");
const Movie = require("../models/movies");
const User = require("../models/User");
const {
  buildMoviesCatalog,
  SECTION_TO_CATEGORY_NAMES,
} = require("../utils/moviesCatalogTransform");
const {
  HOME_SECTION_ORDER,
  HOME_UI_ONLY_SECTIONS,
  parseHomeBatchQuery,
} = require("../utils/homeCatalog");
const { success } = require("../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const { applyPagination } = require("../utils/queryOptimizer");
const { verifyToken } = require("../utils/token");
const { normalizeMovieMediaFields } = require("../utils/mediaUrl");
const { resolveMovieNumericId } = require("../services/movieService");

const router = express.Router();

const normalizeMovie = ({ _id, movieId, createdAt, updatedAt, ...movie }) => {
  const id = resolveMovieNumericId({ movieId, id: movie.id });
  return normalizeMovieMediaFields({
    ...movie,
    movieId: id,
    id,
    // Cold-start tavsiyalar uchun (eng oxirgi joylangan)
    createdAt,
  });
};

const resolveOptionalUser = async (req) => {
  const authHeader = req.headers.authorization || "";
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  try {
    const payload = verifyToken(token);
    if (!payload?.userId) return null;
    return await User.findById(payload.userId).lean();
  } catch (_error) {
    return null;
  }
};

const loadPopularMovieScores = async () => {
  const rows = await User.aggregate([
    { $unwind: { path: "$viewedMovies", preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: "$viewedMovies.movieId",
        totalViews: { $sum: { $ifNull: ["$viewedMovies.viewCount", 1] } },
        uniqueUsers: { $sum: 1 },
      },
    },
    { $sort: { totalViews: -1, uniqueUsers: -1 } },
    { $limit: 200 },
  ]);

  const maxViews = rows.length ? Math.max(...rows.map((row) => Number(row.totalViews) || 0), 1) : 1;
  const scores = new Map();
  rows.forEach((row) => {
    const movieId = Number(row?._id);
    if (!Number.isFinite(movieId)) return;
    const totalViews = Number(row?.totalViews) || 0;
    const uniqueUsers = Number(row?.uniqueUsers) || 0;
    const normalizedViews = totalViews / maxViews;
    const uniquenessBoost = Math.min(uniqueUsers / 10, 1) * 0.2;
    scores.set(movieId, normalizedViews + uniquenessBoost);
  });
  return scores;
};

const resolveSectionQuery = (raw) => {
  const section = String(raw || "").trim();
  if (!section) return null;
  if (section === "korea") return "koreaDrama";
  if (section === "recommended") return "recommended";
  if (SECTION_TO_CATEGORY_NAMES[section]) return section;
  return null;
};

const loadSectionPreview = async (sectionKey, limit, { user, popularMovieScores }) => {
  if (sectionKey === "recommended") {
    const rawMovies = await Movie.find().sort({ movieId: 1 }).select("-__v").lean();
    const movies = rawMovies.map(normalizeMovie);
    const catalog = buildMoviesCatalog(movies, { user, popularMovieScores });
    const recommended = catalog.recommendedMovies || [];
    const items = recommended.slice(0, limit);
    return {
      items,
      hasMore: recommended.length > limit,
    };
  }

  const categoryNames = SECTION_TO_CATEGORY_NAMES[sectionKey] || [];
  if (!categoryNames.length) {
    return { items: [], hasMore: false };
  }

  const filter = {
    $or: [
      { categoryName: { $in: categoryNames } },
      { category: sectionKey },
    ],
  };
  const total = await Movie.countDocuments(filter);
  const rawMovies = await Movie.find(filter)
    .sort({ movieId: 1 })
    .limit(limit)
    .select("-__v")
    .lean();
  const movies = rawMovies.map(normalizeMovie);
  const catalog = buildMoviesCatalog(movies, { user, popularMovieScores });
  const sectionItems = catalog.sections?.[sectionKey] || [];
  const items = sectionItems.length ? sectionItems : catalog.allMovies || [];
  return {
    items,
    hasMore: total > limit,
  };
};

/**
 * Home optimizatsiya:
 * batch=0 → recommended (limit) + birinchi batchSize bo'lim (har biridan limit)
 * batch=1+ → keyingi batchSize bo'lim
 */
router.get("/home", async (req, res, next) => {
  try {
    const { batch, limitPerSection, batchSize } = parseHomeBatchQuery(req.query);
    const user = await resolveOptionalUser(req);
    const popularMovieScores = await loadPopularMovieScores();

    const start = batch * batchSize;
    const sectionKeys = HOME_SECTION_ORDER.slice(start, start + batchSize);
    const visibleCount = Math.min(HOME_SECTION_ORDER.length, start + sectionKeys.length);
    const hasNextBatch = visibleCount < HOME_SECTION_ORDER.length;

    const sections = {};
    const sectionHasMore = {};
    const allMovies = [];

    let recommendedMovies = [];
    if (batch === 0) {
      const [recommended, anonslar] = await Promise.all([
        loadSectionPreview("recommended", limitPerSection, {
          user,
          popularMovieScores,
        }),
        loadSectionPreview("anonslar", limitPerSection, {
          user,
          popularMovieScores,
        }),
      ]);
      recommendedMovies = recommended.items;
      sectionHasMore.recommended = recommended.hasMore;
      recommended.items.forEach((movie) => allMovies.push(movie));

      sections.anonslar = anonslar.items;
      sectionHasMore.anonslar = anonslar.hasMore;
      anonslar.items.forEach((movie) => allMovies.push(movie));
    }

    const apiSectionKeys = sectionKeys.filter((key) => key && !HOME_UI_ONLY_SECTIONS.has(key));
    const previews = await Promise.all(
      apiSectionKeys.map(async (sectionKey) => {
        const preview = await loadSectionPreview(sectionKey, limitPerSection, {
          user,
          popularMovieScores,
        });
        return { sectionKey, ...preview };
      })
    );

    previews.forEach(({ sectionKey, items, hasMore }) => {
      sections[sectionKey] = items;
      sectionHasMore[sectionKey] = hasMore;
      items.forEach((movie) => allMovies.push(movie));
    });

    return success(
      res,
      {
        recommendedMovies,
        sections,
        sectionKeys,
        sectionOrder: HOME_SECTION_ORDER,
        sectionHasMore,
        allMovies,
      },
      "Home katalog batch",
      200,
      {
        batch,
        batchSize,
        limitPerSection,
        nextBatch: hasNextBatch ? batch + 1 : null,
        hasNextBatch,
        visibleCount,
        totalSections: HOME_SECTION_ORDER.length,
        includeRecommended: batch === 0,
        includeAnonslar: batch === 0,
      }
    );
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const section = resolveSectionQuery(req.query.section);
    const user = await resolveOptionalUser(req);
    const popularMovieScores = await loadPopularMovieScores();

    if (section === "recommended") {
      const rawMovies = await Movie.find().sort({ movieId: 1 }).select("-__v").lean();
      const movies = rawMovies.map(normalizeMovie);
      const catalog = buildMoviesCatalog(movies, { user, popularMovieScores });
      const recommended = catalog.recommendedMovies || [];
      const pageItems = recommended.slice(
        pagination.skip,
        pagination.skip + pagination.limit
      );
      return success(
        res,
        {
          allMovies: pageItems,
          recommendedMovies: pageItems,
          sections: {},
        },
        "Katalog ma'lumotlari",
        200,
        buildPaginationMeta(recommended.length, pagination)
      );
    }

    if (section) {
      const categoryNames = SECTION_TO_CATEGORY_NAMES[section] || [];
      const filter = {
        $or: [
          { categoryName: { $in: categoryNames } },
          { category: section },
        ],
      };
      const total = await Movie.countDocuments(filter);
      const rawMovies = await applyPagination(
        Movie.find(filter).sort({ movieId: 1 }).select("-__v"),
        pagination
      ).lean();
      const movies = rawMovies.map(normalizeMovie);
      const catalog = buildMoviesCatalog(movies, { user, popularMovieScores });
      const sectionItems = catalog.sections?.[section] || [];
      const allMovies = sectionItems.length ? sectionItems : catalog.allMovies || [];
      return success(
        res,
        {
          allMovies,
          recommendedMovies: catalog.recommendedMovies,
          sections: { [section]: allMovies },
        },
        "Katalog ma'lumotlari",
        200,
        buildPaginationMeta(total, pagination)
      );
    }

    const total = await Movie.countDocuments();
    const rawMovies = await applyPagination(
      Movie.find().sort({ movieId: 1 }).select("-__v"),
      pagination
    ).lean();
    const movies = rawMovies.map(normalizeMovie);
    const payload = buildMoviesCatalog(movies, { user, popularMovieScores });
    return success(
      res,
      payload,
      "Katalog ma'lumotlari",
      200,
      buildPaginationMeta(total, pagination)
    );
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
