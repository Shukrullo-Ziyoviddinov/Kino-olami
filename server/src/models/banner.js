const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    bannerId: {
      type: Number,
      required: true,
      index: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    titleImg: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    lang: {
      type: String,
      enum: ["uz", "ru"],
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bannerSchema.index({ bannerId: 1, lang: 1 }, { unique: true });

module.exports = mongoose.model("Banner", bannerSchema);
