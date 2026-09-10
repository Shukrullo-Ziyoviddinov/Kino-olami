const mongoose = require("mongoose");

const genresSchema = new mongoose.Schema(
  {
    genreId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      uz: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
    },
    img: {
      type: String,
      required: true,
      trim: true,
    },
    filterGenre: {
      type: [String],
      required: true,
      default: [],
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

module.exports = mongoose.model("Genre", genresSchema);
