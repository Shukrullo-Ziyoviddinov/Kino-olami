const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  _id: String,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("MoviyIdentity", schema);
