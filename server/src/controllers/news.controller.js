const newsService = require("../services/newsService");
const { NEWS_SECTIONS } = require("../models/news");
const { registerNewsView } = require("../utils/newsViews");
const { success, fail } = require("../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

const list = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const activeOnly =
      String(req.query.active || "") === "1" || String(req.query.active || "") === "true";
    const section = String(req.query.section || "").trim();

    if (section && !NEWS_SECTIONS.includes(section)) {
      return fail(
        res,
        `Noto'g'ri section. Ruxsat: ${NEWS_SECTIONS.join(", ")}`,
        400
      );
    }

    const { items, total } = await newsService.listNews({
      skip: pagination.skip,
      limit: pagination.limit,
      activeOnly,
      section,
    });

    return success(
      res,
      items,
      "Yangiliklar ro'yxati",
      200,
      buildPaginationMeta(total, pagination)
    );
  } catch (error) {
    return next(error);
  }
};

const layout = async (req, res, next) => {
  try {
    const activeOnly =
      req.query.active === undefined
        ? true
        : String(req.query.active || "") === "1" || String(req.query.active || "") === "true";

    const data = await newsService.getNewsLayout({ activeOnly });
    return success(res, data, "News layout");
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const newsId = Number(req.params.newsId || req.params.id);
    if (!Number.isFinite(newsId)) {
      return fail(res, "Noto'g'ri newsId.", 400);
    }
    const item = await newsService.getNewsById(newsId);
    if (!item) {
      return fail(res, "Yangilik topilmadi.", 404);
    }
    return success(res, item, "Yangilik ma'lumoti");
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const body = req.body || {};
    const section = String(body.section || "").trim();
    const nameUz = body?.name?.uz || body?.Name?.uz || body?.name || body?.Name;

    if (!section || !NEWS_SECTIONS.includes(section)) {
      return fail(
        res,
        `section majburiy. Ruxsat: ${NEWS_SECTIONS.join(", ")}`,
        400
      );
    }
    if (!nameUz) {
      return fail(res, "name majburiy.", 400);
    }

    const created = await newsService.createNews(body);
    return success(res, created, "Yangilik yaratildi", 201);
  } catch (error) {
    if (error?.statusCode) {
      return fail(res, error.message, error.statusCode);
    }
    if (error?.code === 11000) {
      return fail(res, "Bu newsId allaqachon mavjud.", 409);
    }
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const newsId = Number(req.params.newsId || req.params.id);
    if (!Number.isFinite(newsId)) {
      return fail(res, "Noto'g'ri newsId.", 400);
    }
    const updated = await newsService.updateNews(newsId, req.body || {});
    if (!updated) {
      return fail(res, "Yangilik topilmadi.", 404);
    }
    return success(res, updated, "Yangilik yangilandi.");
  } catch (error) {
    if (error?.statusCode) {
      return fail(res, error.message, error.statusCode);
    }
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const newsId = Number(req.params.newsId || req.params.id);
    if (!Number.isFinite(newsId)) {
      return fail(res, "Noto'g'ri newsId.", 400);
    }
    const deleted = await newsService.deleteNews(newsId);
    if (!deleted) {
      return fail(res, "Yangilik topilmadi.", 404);
    }
    return success(res, null, "Yangilik o'chirildi.");
  } catch (error) {
    return next(error);
  }
};

const registerView = async (req, res, next) => {
  try {
    const newsId = Number(req.params.newsId || req.params.id);
    if (!Number.isFinite(newsId)) {
      return fail(res, "Noto'g'ri newsId.", 400);
    }

    const result = await registerNewsView({
      user: req.user,
      newsId,
    });

    return success(
      res,
      result,
      result.counted ? "Ko'rish qo'shildi." : "Bu yangilik allaqachon ko'rilgan."
    );
  } catch (error) {
    if (error?.statusCode) {
      return fail(res, error.message, error.statusCode);
    }
    return next(error);
  }
};

module.exports = {
  list,
  layout,
  getById,
  create,
  update,
  remove,
  registerView,
};
