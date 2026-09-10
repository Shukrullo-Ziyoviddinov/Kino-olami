const express = require("express");
const AdminProfile = require("../models/adminProfile");
const AdminLoginLog = require("../models/adminLoginLog");
const BotUser = require("../models/BotUser");
const User = require("../models/User");
const Movie = require("../models/movies");
const Actor = require("../models/actors");
const Banner = require("../models/banner");
const Ads = require("../models/ads");
const Genre = require("../models/genres");
const Triller = require("../models/triller");
const { success, fail } = require("../utils/apiResponse");
const bot = require("../bot/bot");
const { sendBroadcastToAll } = require("../bot/handlers/broadcastSender");

const router = express.Router();

const getDateBeforeDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const getStartOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

async function buildBotStatistics() {
  const startOfMonth = getStartOfCurrentMonth();
  const [totalUsers, active1d, active7d, active30d, active365d, new1d, new7d, new30d, new365d, totalBeforeThisMonth] =
    await Promise.all([
      BotUser.countDocuments({ isActive: true }),
      BotUser.countDocuments({ isActive: true, lastSeenAt: { $gte: getDateBeforeDays(1) } }),
      BotUser.countDocuments({ isActive: true, lastSeenAt: { $gte: getDateBeforeDays(7) } }),
      BotUser.countDocuments({ isActive: true, lastSeenAt: { $gte: getDateBeforeDays(30) } }),
      BotUser.countDocuments({ isActive: true, lastSeenAt: { $gte: getDateBeforeDays(365) } }),
      BotUser.countDocuments({ isActive: true, createdAt: { $gte: getDateBeforeDays(1) } }),
      BotUser.countDocuments({ isActive: true, createdAt: { $gte: getDateBeforeDays(7) } }),
      BotUser.countDocuments({ isActive: true, createdAt: { $gte: getDateBeforeDays(30) } }),
      BotUser.countDocuments({ isActive: true, createdAt: { $gte: getDateBeforeDays(365) } }),
      BotUser.countDocuments({ isActive: true, createdAt: { $lt: startOfMonth } }),
    ]);

  return {
    totalUsers,
    totalBeforeThisMonth,
    visits: { day: active1d, week: active7d, month: active30d, year: active365d },
    registrations: { day: new1d, week: new7d, month: new30d, year: new365d },
    activeUsers: { day: active1d, week: active7d, month: active30d, year: active365d },
  };
}

async function buildSiteStatistics() {
  const startOfMonth = getStartOfCurrentMonth();
  const [totalUsers, new1d, new7d, new30d, new365d, active1d, active7d, active30d, active365d, totalBeforeThisMonth] =
    await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: getDateBeforeDays(1) } }),
      User.countDocuments({ createdAt: { $gte: getDateBeforeDays(7) } }),
      User.countDocuments({ createdAt: { $gte: getDateBeforeDays(30) } }),
      User.countDocuments({ createdAt: { $gte: getDateBeforeDays(365) } }),
      User.countDocuments({ "viewedMovies.viewedAt": { $gte: getDateBeforeDays(1) } }),
      User.countDocuments({ "viewedMovies.viewedAt": { $gte: getDateBeforeDays(7) } }),
      User.countDocuments({ "viewedMovies.viewedAt": { $gte: getDateBeforeDays(30) } }),
      User.countDocuments({ "viewedMovies.viewedAt": { $gte: getDateBeforeDays(365) } }),
      User.countDocuments({ createdAt: { $lt: startOfMonth } }),
    ]);

  const visitAgg = await User.aggregate([
    { $unwind: "$viewedMovies" },
    {
      $facet: {
        day: [{ $match: { "viewedMovies.viewedAt": { $gte: getDateBeforeDays(1) } } }, { $count: "count" }],
        week: [{ $match: { "viewedMovies.viewedAt": { $gte: getDateBeforeDays(7) } } }, { $count: "count" }],
        month: [{ $match: { "viewedMovies.viewedAt": { $gte: getDateBeforeDays(30) } } }, { $count: "count" }],
        year: [{ $match: { "viewedMovies.viewedAt": { $gte: getDateBeforeDays(365) } } }, { $count: "count" }],
      },
    },
  ]);

  const visits = visitAgg?.[0] || {};
  return {
    totalUsers,
    totalBeforeThisMonth,
    registrations: { day: new1d, week: new7d, month: new30d, year: new365d },
    activeUsers: { day: active1d, week: active7d, month: active30d, year: active365d },
    visits: {
      day: visits?.day?.[0]?.count || 0,
      week: visits?.week?.[0]?.count || 0,
      month: visits?.month?.[0]?.count || 0,
      year: visits?.year?.[0]?.count || 0,
    },
  };
}

/**
 * POST /api/admin/login
 * Body: { firstName, lastName, password }
 * Profilni yangilaydi va kirish tarixiga yozadi.
 */
router.post("/login", async (req, res, next) => {
  try {
    const firstName = String(req.body?.firstName || "").trim();
    const lastName = String(req.body?.lastName || "").trim();
    const password = String(req.body?.password || "");

    if (!firstName || !lastName || !password) {
      return fail(res, "Ism, familiya va parolni to'ldiring.", 400);
    }

    const expectedPassword = String(process.env.ADMIN_PASSWORD || "").trim();
    if (!expectedPassword) {
      return fail(res, "Server sozlamalari to'liq emas.", 503);
    }

    if (password !== expectedPassword) {
      return fail(res, "Parol noto'g'ri.", 401);
    }

    const now = new Date();
    const profile = await AdminProfile.findOneAndUpdate(
      { key: "default" },
      { $set: { firstName, lastName, lastLoginAt: now } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await AdminLoginLog.create({
      firstName,
      lastName,
      ip: req.ip || "",
      userAgent: req.get("user-agent") || "",
    });

    return success(
      res,
      {
        firstName: profile.firstName,
        lastName: profile.lastName,
        lastLoginAt: profile.lastLoginAt,
      },
      "Muvaffaqiyatli kirildi"
    );
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/admin/profile
 * Oxirgi saqlangan admin profili (parolsiz).
 */
router.get("/profile", async (req, res, next) => {
  try {
    const profile = await AdminProfile.findOne({ key: "default" }).lean();
    if (!profile) {
      return success(res, null, "Profil hali yo'q");
    }
    return success(res, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      lastLoginAt: profile.lastLoginAt,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/bot-broadcast", async (req, res, next) => {
  try {
    if (!bot) {
      return fail(res, "Bot ishga tushmagan.", 503);
    }

    const title = String(req.body?.title || "").trim();
    const text = String(req.body?.text || "").trim();
    const mediaType = String(req.body?.mediaType || "").trim();
    const mediaDataUrl = String(req.body?.mediaDataUrl || "").trim();
    const buttons = Array.isArray(req.body?.buttons) ? req.body.buttons : [];

    if (!title && !text && !mediaDataUrl) {
      return fail(res, "Kamida title, text yoki media bo'lishi kerak.", 400);
    }
    if (mediaType && !["photo", "video"].includes(mediaType)) {
      return fail(res, "mediaType noto'g'ri.", 400);
    }
    if (mediaDataUrl && !mediaType) {
      return fail(res, "Media turi tanlanmagan.", 400);
    }

    const result = await sendBroadcastToAll(bot, {
      title,
      text,
      mediaType: mediaType || null,
      mediaDataUrl: mediaDataUrl || null,
      buttons,
    });

    return success(res, result, "Reklama yuborildi.");
  } catch (err) {
    return next(err);
  }
});

router.get("/statistics", async (_req, res, next) => {
  try {
    const [botStats, siteStats] = await Promise.all([
      buildBotStatistics(),
      buildSiteStatistics(),
    ]);
    return success(res, { bot: botStats, site: siteStats }, "Statistika olindi.");
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/admin/dashboard-counts
 * Dashboard stat-cardlar uchun collection sonlari.
 */
router.get("/dashboard-counts", async (_req, res, next) => {
  try {
    const [movies, actors, banners, ads, genres, trillers] = await Promise.all([
      Movie.countDocuments(),
      Actor.countDocuments(),
      Banner.countDocuments(),
      Ads.countDocuments(),
      Genre.countDocuments(),
      Triller.countDocuments(),
    ]);

    return success(
      res,
      { movies, actors, banners, ads, genres, trillers },
      "Dashboard sonlari olindi."
    );
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
