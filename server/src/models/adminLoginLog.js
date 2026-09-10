const mongoose = require("mongoose");

/**
 * Har bir muvaffaqiyatli kirish yozuvi (audit).
 */
const adminLoginLogSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

adminLoginLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AdminLoginLog", adminLoginLogSchema);
