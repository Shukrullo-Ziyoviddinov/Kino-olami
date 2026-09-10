const mongoose = require("mongoose");

const moviesCatalogSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number,
      required: true,
      index: true,
    },
    categoryName: {
      type: String,
      default: "",
      index: true,
    },
    category: {
      type: String,
      default: "",
      index: true,
    },
    typeCategory: {
      type: [String],
      default: [],
    },
  },
  {
    strict: false,
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("MoviesCatalog", moviesCatalogSchema);
