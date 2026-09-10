const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    strict: false,
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Movie", movieSchema);
