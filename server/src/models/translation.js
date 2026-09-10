const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema(
  {
    namespace: {
      type: String,
      required: true,
      default: "common",
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    uz: {
      type: String,
      default: "",
    },
    ru: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

translationSchema.index({ namespace: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("Translation", translationSchema);
