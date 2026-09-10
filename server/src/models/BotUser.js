const mongoose = require("mongoose");

const botUserSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    chatId: {
      type: Number,
      required: true,
      index: true,
    },
    username: {
      type: String,
      default: "",
      trim: true,
    },
    firstName: {
      type: String,
      default: "",
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    language: {
      type: String,
      enum: ["uz", "ru"],
      default: "uz",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("BotUser", botUserSchema);
