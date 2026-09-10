const mongoose = require("mongoose");

const adsSchema = new mongoose.Schema(
  {
    adId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Ads", adsSchema);
