const mongoose = require("mongoose");

const NEWS_SECTIONS = ["yangiliklar", "trenddagiYangiliklar", "yangiliklarGrid"];

const localizedString = {
  uz: { type: String, default: "", trim: true },
  ru: { type: String, default: "", trim: true },
};

const newsSchema = new mongoose.Schema(
  {
    newsId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      enum: NEWS_SECTIONS,
      index: true,
    },
    name: {
      type: localizedString,
      required: true,
    },
    description: {
      type: localizedString,
      default: () => ({ uz: "", ru: "" }),
    },
    img: {
      type: String,
      default: "",
      trim: true,
    },
    video: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 1,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "news",
  }
);

newsSchema.index({ section: 1, sortOrder: 1, newsId: 1 });

module.exports = mongoose.model("News", newsSchema);
module.exports.NEWS_SECTIONS = NEWS_SECTIONS;
