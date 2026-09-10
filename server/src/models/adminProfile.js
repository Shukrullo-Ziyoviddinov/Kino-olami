const mongoose = require("mongoose");

/**
 * Oxirgi muvaffaqiyatli admin kirish profili (singleton: key === "default").
 */
const adminProfileSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminProfile", adminProfileSchema);
