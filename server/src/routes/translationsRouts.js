const express = require("express");
const Translation = require("../models/translation");
const { success, fail } = require("../utils/apiResponse");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const namespace = String(req.query?.namespace || "common").trim();
    const rows = await Translation.find({ namespace, isActive: true }).sort({ key: 1 }).lean();
    return success(res, rows, "Tarjimalar ro'yxati");
  } catch (error) {
    return next(error);
  }
});

router.put("/:namespace", async (req, res, next) => {
  try {
    const namespace = String(req.params.namespace || "").trim();
    if (!namespace) {
      return fail(res, "namespace majburiy.");
    }

    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const prepared = items
      .map((item) => ({
        key: String(item?.key || "").trim(),
        uz: String(item?.uz || ""),
        ru: String(item?.ru || ""),
        isActive: item?.isActive !== false,
      }))
      .filter((item) => item.key);

    const keepKeys = [...new Set(prepared.map((item) => item.key))];

    if (!keepKeys.length) {
      await Translation.deleteMany({ namespace });
      return success(res, [], "Tarjimalar saqlandi.");
    }

    await Translation.deleteMany({
      namespace,
      key: { $nin: keepKeys },
    });

    const saved = await Promise.all(
      prepared.map((item) =>
        Translation.findOneAndUpdate(
          { namespace, key: item.key },
          {
            $set: {
              namespace,
              key: item.key,
              uz: item.uz,
              ru: item.ru,
              isActive: item.isActive,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    return success(res, saved, "Tarjimalar saqlandi.");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
