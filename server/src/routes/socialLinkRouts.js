const express = require("express");
const SocialLink = require("../models/socialLink");
const { success, fail } = require("../utils/apiResponse");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await SocialLink.find({ isActive: true }).sort({
      type: 1,
      sortOrder: 1,
    });

    const payload = {
      contact: {},
      social: {},
      appStore: {},
      subscription: {},
    };

    rows.forEach((row) => {
      payload[row.type][row.key] = {
        link: row.link || undefined,
        label: row.label || undefined,
        icon: row.icon || undefined,
        address: row.address || undefined,
      };
    });

    return success(res, payload, "Ijtimoiy linklar");
  } catch (error) {
    return next(error);
  }
});

router.put("/:type", async (req, res, next) => {
  try {
    const type = String(req.params.type || "").trim();
    if (!["contact", "social", "appStore", "subscription"].includes(type)) {
      return fail(res, "Noto'g'ri type.");
    }

    const rows = Array.isArray(req.body?.items) ? req.body.items : [];

    const preparedRows = rows
      .filter((item) => String(item?.key || "").trim())
      .map((item, idx) => ({
        key: String(item.key).trim(),
        link: String(item.link || "").trim(),
        label: String(item.label || "").trim(),
        icon: String(item.icon || "").trim(),
        address: String(item.address || "").trim(),
        isActive: item.isActive !== false,
        sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : idx + 1,
      }));

    const keepKeys = [...new Set(preparedRows.map((item) => item.key))];

    // Full sync: bo'sh ro'yxat kelsa shu type dagi hammasi o'chiriladi.
    if (!keepKeys.length) {
      await SocialLink.deleteMany({ type });
      return success(res, [], "Linklar saqlandi.");
    }

    // Requestda yo'q keylar ushbu type uchun o'chiriladi.
    await SocialLink.deleteMany({ type, key: { $nin: keepKeys } });

    const operations = preparedRows.map((item) =>
      SocialLink.findOneAndUpdate(
        { type, key: item.key },
        {
          $set: {
            type,
            key: item.key,
            link: item.link,
            label: item.label,
            icon: item.icon,
            address: item.address,
            isActive: item.isActive,
            sortOrder: item.sortOrder,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );

    const saved = await Promise.all(operations);
    return success(res, saved, "Linklar saqlandi.");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
