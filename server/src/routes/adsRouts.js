const express = require("express");
const Ads = require("../models/ads");
const { success, fail } = require("../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const { applyPagination } = require("../utils/queryOptimizer");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const total = await Ads.countDocuments();
    const rows = await applyPagination(
      Ads.find().sort({ isActive: -1, sortOrder: 1, adId: 1 }).select("-__v"),
      pagination
    ).lean();
    return success(res, rows, "Reklamalar ro'yxati", 200, buildPaginationMeta(total, pagination));
  } catch (error) {
    return next(error);
  }
});

router.get("/active", async (_req, res, next) => {
  try {
    const activeAd = await Ads.findOne({ isActive: true })
      .sort({ sortOrder: 1, adId: 1 })
      .lean();

    if (activeAd) {
      return success(res, activeAd, "Aktiv reklama");
    }

    const fallbackAd = await Ads.findOne().sort({ sortOrder: 1, adId: 1 }).lean();
    return success(res, fallbackAd || null, "Fallback reklama");
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { adId, videoUrl, isActive = true, sortOrder = 1 } = req.body || {};

    if (!videoUrl || typeof videoUrl !== "string") {
      return fail(res, "videoUrl majburiy.");
    }

    let nextAdId = Number(adId);
    if (!Number.isFinite(nextAdId) || nextAdId <= 0) {
      const last = await Ads.findOne().sort({ adId: -1 }).select("adId").lean();
      nextAdId = Number(last?.adId || 0) + 1;
    }

    const created = await Ads.create({
      adId: nextAdId,
      videoUrl: String(videoUrl).trim(),
      isActive: Boolean(isActive),
      sortOrder: Number(sortOrder) || 1,
    });

    return success(res, created, "Reklama yaratildi", 201);
  } catch (error) {
    if (error?.code === 11000) {
      return fail(res, "Bu adId allaqachon mavjud.", 409);
    }
    return next(error);
  }
});

router.put("/:adId", async (req, res, next) => {
  try {
    const adId = Number(req.params.adId);
    if (!Number.isFinite(adId)) {
      return fail(res, "Noto'g'ri adId.", 400);
    }
    const updated = await Ads.findOneAndUpdate(
      { adId },
      { $set: req.body || {} },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return fail(res, "Reklama topilmadi.", 404);
    }
    return success(res, updated, "Reklama yangilandi.");
  } catch (error) {
    return next(error);
  }
});

router.delete("/:adId", async (req, res, next) => {
  try {
    const adId = Number(req.params.adId);
    if (!Number.isFinite(adId)) {
      return fail(res, "Noto'g'ri adId.", 400);
    }
    const deleted = await Ads.findOneAndDelete({ adId });
    if (!deleted) {
      return fail(res, "Reklama topilmadi.", 404);
    }
    return success(res, null, "Reklama o'chirildi.");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
