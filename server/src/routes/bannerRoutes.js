const express = require("express");
const Banner = require("../models/banner");
const Movie = require("../models/movies");
const { success, fail } = require("../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const { applyPagination } = require("../utils/queryOptimizer");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const total = await Banner.countDocuments();
    const banners = await applyPagination(
      Banner.find().sort({ sortOrder: 1, bannerId: 1 }).select("-__v"),
      pagination
    ).lean();
    return success(res, banners, "Bannerlar ro'yxati", 200, buildPaginationMeta(total, pagination));
  } catch (error) {
    return next(error);
  }
});

router.get("/active", async (req, res, next) => {
  try {
    const { lang } = req.query;
    const query = { isActive: true };

    if (lang) {
      query.lang = lang;
    }

    const banners = await Banner.find(query)
      .sort({ sortOrder: 1, bannerId: 1 })
      .select("-__v")
      .lean();

    const movieIds = [...new Set(
      banners
        .map((banner) => Number(banner.movieId))
        .filter(Number.isFinite)
    )];
    const movies = movieIds.length
      ? await Movie.find({
          $or: [
            { movieId: { $in: movieIds } },
            { id: { $in: movieIds } },
          ],
        })
          .select("movieId id specs")
          .lean()
      : [];
    const specsByMovieId = new Map();
    movies.forEach((movie) => {
      if (Number.isFinite(Number(movie.movieId))) {
        specsByMovieId.set(Number(movie.movieId), movie.specs || null);
      }
      if (Number.isFinite(Number(movie.id))) {
        specsByMovieId.set(Number(movie.id), movie.specs || null);
      }
    });
    const rows = banners.map((banner) => ({
      ...banner,
      specs: specsByMovieId.get(Number(banner.movieId)) || null,
    }));

    return success(res, rows, "Aktiv bannerlar");
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    return success(res, banner, "Banner yaratildi", 201);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      return fail(res, "Banner topilmadi.", 404);
    }

    return success(res, banner, "Banner yangilandi");
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return fail(res, "Banner topilmadi.", 404);
    }

    return success(res, null, "Banner o'chirildi.");
  } catch (error) {
    return next(error);
  }
});

router.put("/by-banner-id/:bannerId", async (req, res, next) => {
  try {
    const bannerId = Number(req.params.bannerId);
    if (!Number.isFinite(bannerId)) {
      return fail(res, "Noto'g'ri bannerId.", 400);
    }
    await Banner.updateMany({ bannerId }, { $set: req.body || {} });
    const rows = await Banner.find({ bannerId }).select("-__v").lean();
    return success(res, rows, "Bannerlar yangilandi.");
  } catch (error) {
    return next(error);
  }
});

router.delete("/by-banner-id/:bannerId", async (req, res, next) => {
  try {
    const bannerId = Number(req.params.bannerId);
    if (!Number.isFinite(bannerId)) {
      return fail(res, "Noto'g'ri bannerId.", 400);
    }
    await Banner.deleteMany({ bannerId });
    return success(res, null, "Banner o'chirildi.");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
