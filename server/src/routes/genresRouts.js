const express = require("express");
const Genre = require("../models/genres");
const { success, fail } = require("../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const { applyPagination } = require("../utils/queryOptimizer");

const router = express.Router();
const ALLOWED_FILTER_GENRES = [
  "Drama",
  "Romantika",
  "Sarguzasht",
  "Qo'rqinchli",
  "Jangari",
  "Anime",
  "Boevik",
  "Komediya",
  "Detektiv",
  "Oilaviy",
  "Fantastika",
  "Multfilim",
  "Melodrama",
];

router.get("/", async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const query = { isActive: true };
    const total = await Genre.countDocuments(query);
    const genres = await applyPagination(
      Genre.find(query).sort({ sortOrder: 1, genreId: 1 }).select("-__v"),
      pagination
    ).lean();
    return success(res, genres, "Janrlar ro'yxati", 200, buildPaginationMeta(total, pagination));
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { genreId, title, img, filterGenre, isActive = true, sortOrder = 0 } = req.body || {};

    if (!genreId || typeof genreId !== "string") {
      return fail(res, "genreId majburiy.");
    }
    if (!title?.uz || !title?.ru) {
      return fail(res, "title.uz va title.ru majburiy.");
    }
    if (!img || typeof img !== "string") {
      return fail(res, "img maydoni majburiy.");
    }

    const normalizedFilterGenre = Array.isArray(filterGenre)
      ? filterGenre
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      : String(filterGenre || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

    if (!normalizedFilterGenre.length) {
      return fail(res, "filterGenre majburiy.");
    }

    const invalidGenres = normalizedFilterGenre.filter(
      (genre) => !ALLOWED_FILTER_GENRES.includes(genre)
    );

    if (invalidGenres.length) {
      return fail(
        res,
        `Noto'g'ri filterGenre: ${invalidGenres.join(", ")}. Faqat ruxsat etilgan janrlarni tanlang.`,
        400
      );
    }

    const created = await Genre.create({
      genreId: String(genreId).trim(),
      title: {
        uz: String(title.uz).trim(),
        ru: String(title.ru).trim(),
      },
      img: String(img).trim(),
      filterGenre: normalizedFilterGenre,
      isActive: Boolean(isActive),
      sortOrder: Number(sortOrder) || 0,
    });

    return success(res, created, "Janr yaratildi", 201);
  } catch (error) {
    if (error?.code === 11000) {
      return fail(res, "Bu genreId allaqachon mavjud.", 409);
    }
    return next(error);
  }
});

router.put("/:genreId", async (req, res, next) => {
  try {
    const genreId = String(req.params.genreId || "").trim();
    if (!genreId) return fail(res, "Noto'g'ri genreId.", 400);

    const updated = await Genre.findOneAndUpdate(
      { genreId },
      { $set: req.body || {} },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return fail(res, "Janr topilmadi.", 404);
    }
    return success(res, updated, "Janr yangilandi.");
  } catch (error) {
    return next(error);
  }
});

router.delete("/:genreId", async (req, res, next) => {
  try {
    const genreId = String(req.params.genreId || "").trim();
    if (!genreId) return fail(res, "Noto'g'ri genreId.", 400);

    const deleted = await Genre.findOneAndDelete({ genreId });
    if (!deleted) {
      return fail(res, "Janr topilmadi.", 404);
    }
    return success(res, null, "Janr o'chirildi.");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
