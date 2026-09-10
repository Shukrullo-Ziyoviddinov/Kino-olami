const mongoose = require("mongoose");

const movieCommentSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number,
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorAvatar: {
      type: String,
      default: null,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MovieComment", movieCommentSchema);
