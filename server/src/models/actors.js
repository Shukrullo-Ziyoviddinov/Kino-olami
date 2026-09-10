const mongoose = require("mongoose");

const actorsSchema = new mongoose.Schema(
  {
    actorId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      uz: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    info: {
      uz: { type: String, default: "", trim: true },
      ru: { type: String, default: "", trim: true },
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

module.exports = mongoose.model("Actor", actorsSchema);
