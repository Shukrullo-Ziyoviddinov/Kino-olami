const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["contact", "social", "appStore", "subscription"],
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    label: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
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

socialLinkSchema.index({ type: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("SocialLink", socialLinkSchema);
