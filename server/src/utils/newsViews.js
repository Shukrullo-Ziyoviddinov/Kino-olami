/**
 * News ko'rishlar: bitta user = bitta news uchun faqat bir marta.
 * Qiymat News schemada saqlanmaydi — User.viewedNews dan hisoblanadi.
 */

const News = require("../models/news");
const User = require("../models/User");

const countNewsViews = async (newsId) => {
  const id = Number(newsId);
  if (!Number.isFinite(id)) return 0;
  return User.countDocuments({
    viewedNews: { $elemMatch: { newsId: id } },
  });
};

const getNewsViewCountsMap = async (newsIds = []) => {
  const ids = [...new Set(newsIds.map(Number).filter((id) => Number.isFinite(id) && id > 0))];
  if (!ids.length) return new Map();

  const rows = await User.aggregate([
    { $match: { "viewedNews.0": { $exists: true } } },
    { $unwind: "$viewedNews" },
    { $match: { "viewedNews.newsId": { $in: ids } } },
    {
      $group: {
        _id: "$viewedNews.newsId",
        views: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [Number(row._id), Number(row.views) || 0]));
};

const registerNewsView = async ({ user, newsId }) => {
  const id = Number(newsId);
  if (!Number.isFinite(id) || id <= 0) {
    const error = new Error("Noto'g'ri newsId.");
    error.statusCode = 400;
    throw error;
  }

  const news = await News.findOne({ newsId: id }).select("newsId").lean();
  if (!news) {
    const error = new Error("Yangilik topilmadi.");
    error.statusCode = 404;
    throw error;
  }

  const userId = user._id;

  // Atomik: faqat oldin ko'rmagan bo'lsa qo'shadi
  const updateResult = await User.updateOne(
    {
      _id: userId,
      viewedNews: { $not: { $elemMatch: { newsId: id } } },
    },
    {
      $push: {
        viewedNews: {
          $each: [{ newsId: id, viewedAt: new Date() }],
          $position: 0,
          $slice: 500,
        },
      },
    }
  );

  const counted = Number(updateResult.modifiedCount || updateResult.nModified || 0) > 0;
  const views = await countNewsViews(id);

  // req.user memoryni ham yangilash (keyingi so'rovlar uchun)
  if (counted) {
    const viewedNews = Array.isArray(user.viewedNews) ? user.viewedNews : [];
    viewedNews.unshift({ newsId: id, viewedAt: new Date() });
    user.viewedNews = viewedNews.slice(0, 500);
  }

  return {
    newsId: id,
    views,
    alreadyViewed: !counted,
    counted,
  };
};

module.exports = {
  registerNewsView,
  countNewsViews,
  getNewsViewCountsMap,
};
