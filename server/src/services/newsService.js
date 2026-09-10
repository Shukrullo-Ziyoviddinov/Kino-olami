const News = require("../models/news");
const { NEWS_SECTIONS } = require("../models/news");
const { attachNewsDateFields } = require("../utils/newsDate");
const { getNewsViewCountsMap } = require("../utils/newsViews");

const toPublicNews = (row, views = 0) => {
  if (!row) return null;
  const { _id, createdAt, updatedAt, views: _legacyViews, ...rest } = row;
  return attachNewsDateFields({
    ...rest,
    id: rest.newsId,
    views: Number(views) || 0,
    createdAt,
    updatedAt,
  });
};

const attachViewsToRows = async (rows = []) => {
  const map = await getNewsViewCountsMap(rows.map((row) => row?.newsId));
  return rows.map((row) => toPublicNews(row, map.get(Number(row.newsId)) || 0));
};

const normalizeLocalized = (value, fallback = "") => {
  if (value && typeof value === "object") {
    return {
      uz: String(value.uz || "").trim(),
      ru: String(value.ru || "").trim(),
    };
  }
  if (typeof value === "string") {
    return { uz: value.trim(), ru: "" };
  }
  return { uz: String(fallback || "").trim(), ru: "" };
};

const buildNewsPayload = (payload = {}, { requireSection = false } = {}) => {
  const next = {};

  if (payload.section !== undefined || requireSection) {
    next.section = String(payload.section || "").trim();
  }
  if (payload.name !== undefined || payload.Name !== undefined) {
    next.name = normalizeLocalized(payload.name ?? payload.Name);
  }
  if (payload.description !== undefined) {
    next.description = normalizeLocalized(payload.description);
  }
  if (payload.img !== undefined) {
    next.img = String(payload.img || "").trim();
  }
  if (payload.video !== undefined) {
    next.video = String(payload.video || "").trim();
  }
  if (payload.isActive !== undefined) {
    next.isActive = payload.isActive !== false && payload.isActive !== "false" && payload.isActive !== 0;
  }
  if (payload.sortOrder !== undefined) {
    const sortOrder = Number(payload.sortOrder);
    if (Number.isFinite(sortOrder)) next.sortOrder = sortOrder;
  }

  return next;
};

const listNews = async ({
  skip = 0,
  limit = 30,
  activeOnly = false,
  section = "",
} = {}) => {
  const filter = {};
  if (activeOnly) filter.isActive = true;
  if (section && NEWS_SECTIONS.includes(section)) {
    filter.section = section;
  }

  const [total, rows] = await Promise.all([
    News.countDocuments(filter),
    News.find(filter)
      .sort({ sortOrder: 1, newsId: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    items: await attachViewsToRows(rows),
    total,
  };
};

const getNewsLayout = async ({ activeOnly = true } = {}) => {
  const filter = activeOnly ? { isActive: true } : {};
  const rows = await News.find(filter).sort({ sortOrder: 1, newsId: 1 }).lean();
  const items = await attachViewsToRows(rows);

  const layout = {
    yangiliklar: [],
    trenddagiYangiliklar: [],
    yangiliklarGrid: [],
  };

  for (const item of items) {
    if (layout[item.section]) {
      layout[item.section].push(item);
    }
  }

  return layout;
};

const getNewsById = async (newsId) => {
  const row = await News.findOne({ newsId }).lean();
  if (!row) return null;
  const [item] = await attachViewsToRows([row]);
  return item;
};

const createNews = async (payload = {}) => {
  let nextId = Number(payload.newsId);
  if (!Number.isFinite(nextId) || nextId <= 0) {
    const last = await News.findOne().sort({ newsId: -1 }).select("newsId").lean();
    nextId = Number(last?.newsId || 0) + 1;
  }

  const data = buildNewsPayload(payload, { requireSection: true });
  if (!NEWS_SECTIONS.includes(data.section)) {
    const error = new Error("Noto'g'ri section.");
    error.statusCode = 400;
    throw error;
  }
  if (!data.name?.uz) {
    const error = new Error("name.uz majburiy.");
    error.statusCode = 400;
    throw error;
  }

  const isTrend = data.section === "trenddagiYangiliklar";
  const video = isTrend ? String(data.video || "").trim() : "";
  if (isTrend && !video) {
    const error = new Error("Trend yangiliklar uchun video majburiy.");
    error.statusCode = 400;
    throw error;
  }

  const created = await News.create({
    newsId: nextId,
    section: data.section,
    name: data.name,
    description: data.description || { uz: "", ru: "" },
    img: data.img || "",
    video,
    isActive: data.isActive !== false,
    sortOrder: Number.isFinite(data.sortOrder) ? data.sortOrder : nextId,
  });

  return toPublicNews(created.toObject(), 0);
};

const updateNews = async (newsId, payload = {}) => {
  const data = buildNewsPayload(payload);

  if (data.section !== undefined && !NEWS_SECTIONS.includes(data.section)) {
    const error = new Error("Noto'g'ri section.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await News.findOne({ newsId }).lean();
  if (!existing) return null;

  const nextSection = data.section || existing.section;
  const isTrend = nextSection === "trenddagiYangiliklar";
  if (data.video !== undefined || data.section !== undefined) {
    data.video = isTrend
      ? String(data.video !== undefined ? data.video : existing.video || "").trim()
      : "";
  }
  if (isTrend && data.video !== undefined && !data.video) {
    const error = new Error("Trend yangiliklar uchun video majburiy.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await News.findOneAndUpdate(
    { newsId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return null;
  const [item] = await attachViewsToRows([updated]);
  return item;
};

const deleteNews = async (newsId) => {
  const deleted = await News.findOneAndDelete({ newsId }).lean();
  if (!deleted) return null;
  return toPublicNews(deleted, 0);
};

module.exports = {
  NEWS_SECTIONS,
  listNews,
  getNewsLayout,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  toPublicNews,
};
