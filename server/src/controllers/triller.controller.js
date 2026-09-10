const trillerService = require("../services/trillerService");
const { success, fail } = require("../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

const list = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const activeOnly = String(req.query.active || "") === "1" || String(req.query.active || "") === "true";
    const { items, total } = await trillerService.listTrillers({
      skip: pagination.skip,
      limit: pagination.limit,
      activeOnly,
    });
    return success(
      res,
      items,
      "Trillerlar ro'yxati",
      200,
      buildPaginationMeta(total, pagination)
    );
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const trillerId = Number(req.params.trillerId || req.params.id);
    if (!Number.isFinite(trillerId)) {
      return fail(res, "Noto'g'ri trillerId.", 400);
    }
    const item = await trillerService.getTrillerById(trillerId);
    if (!item) {
      return fail(res, "Triller topilmadi.", 404);
    }
    return success(res, item, "Triller ma'lumoti");
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const body = req.body || {};
    const video = String(body.trillerVideo || "").trim();
    const nameUz = body?.name?.uz || body?.Name?.uz || body?.name || body?.Name;
    if (!video) {
      return fail(res, "trillerVideo majburiy.", 400);
    }
    if (!nameUz) {
      return fail(res, "name majburiy.", 400);
    }

    const created = await trillerService.createTriller(body);
    return success(res, created, "Triller yaratildi", 201);
  } catch (error) {
    if (error?.code === 11000) {
      return fail(res, "Bu trillerId allaqachon mavjud.", 409);
    }
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const trillerId = Number(req.params.trillerId || req.params.id);
    if (!Number.isFinite(trillerId)) {
      return fail(res, "Noto'g'ri trillerId.", 400);
    }
    const updated = await trillerService.updateTriller(trillerId, req.body || {});
    if (!updated) {
      return fail(res, "Triller topilmadi.", 404);
    }
    return success(res, updated, "Triller yangilandi.");
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const trillerId = Number(req.params.trillerId || req.params.id);
    if (!Number.isFinite(trillerId)) {
      return fail(res, "Noto'g'ri trillerId.", 400);
    }
    const deleted = await trillerService.deleteTriller(trillerId);
    if (!deleted) {
      return fail(res, "Triller topilmadi.", 404);
    }
    return success(res, null, "Triller o'chirildi.");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
