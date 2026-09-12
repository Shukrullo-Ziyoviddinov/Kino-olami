const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    wishlist: {
      type: [Number],
      default: [],
    },
    movieReactions: {
      type: Map,
      of: String,
      default: {},
    },
    viewedMovies: {
      type: [
        {
          movieId: { type: Number, required: true },
          viewedAt: { type: Date, default: Date.now },
          viewCount: { type: Number, default: 1 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
