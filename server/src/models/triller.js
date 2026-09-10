const mongoose = require("mongoose");

const localizedString = {
  uz: { type: String, default: "", trim: true },
  ru: { type: String, default: "", trim: true },
};

const trillerSchema = new mongoose.Schema(
  {
    trillerId: {
      type: Number,
      required: true,
      unique: true,
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
    trillerVideo: {
      type: String,
      required: true,
      trim: true,
    },
    img: {
      type: String,
      default: "",
      trim: true,
    },
    movieId: {
      type: Number,
      default: null,
      index: true,
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
    collection: "trillers",
  }
);

module.exports = mongoose.model("Triller", trillerSchema);
