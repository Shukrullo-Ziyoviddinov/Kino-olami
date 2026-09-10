const Triller = require("../models/triller");

const toMovieId = (value) => {
  if (value == null || value === "") return null;
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const toPublicTriller = (row) => {
  if (!row) return null;
  const { _id, createdAt, updatedAt, ...rest } = row;
  return {
    ...rest,
    id: rest.trillerId,
    movieId: toMovieId(rest.movieId),
  };
};

const listTrillers = async ({ skip = 0, limit = 30, activeOnly = false } = {}) => {
  const filter = activeOnly ? { isActive: true } : {};
  const [total, rows] = await Promise.all([
    Triller.countDocuments(filter),
    Triller.find(filter)
      .sort({ sortOrder: 1, trillerId: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    items: rows.map(toPublicTriller),
    total,
  };
};

const getTrillerById = async (trillerId) => {
  const row = await Triller.findOne({ trillerId }).lean();
  return toPublicTriller(row);
};

const createTriller = async (payload = {}) => {
  let nextId = Number(payload.trillerId);
  if (!Number.isFinite(nextId) || nextId <= 0) {
    const last = await Triller.findOne().sort({ trillerId: -1 }).select("trillerId").lean();
    nextId = Number(last?.trillerId || 0) + 1;
  }

  const created = await Triller.create({
    trillerId: nextId,
    name: {
      uz: payload?.name?.uz || payload?.Name?.uz || (typeof payload?.name === "string" ? payload.name : "") || (typeof payload?.Name === "string" ? payload.Name : ""),
      ru: payload?.name?.ru || payload?.Name?.ru || "",
    },
    description: {
      uz: payload?.description?.uz || (typeof payload?.description === "string" ? payload.description : "") || "",
      ru: payload?.description?.ru || "",
    },
    trillerVideo: String(payload.trillerVideo || "").trim(),
    img: String(payload.img || "").trim(),
    movieId: toMovieId(payload.movieId),
    isActive: payload.isActive !== false,
    sortOrder: Number(payload.sortOrder) || nextId,
  });

  return toPublicTriller(created.toObject());
};

const updateTriller = async (trillerId, payload = {}) => {
  const next = { ...payload };
  if (Object.prototype.hasOwnProperty.call(payload, "movieId")) {
    next.movieId = toMovieId(payload.movieId);
  }

  const updated = await Triller.findOneAndUpdate(
    { trillerId },
    { $set: next },
    { new: true, runValidators: true }
  ).lean();
  return toPublicTriller(updated);
};

const deleteTriller = async (trillerId) => {
  const deleted = await Triller.findOneAndDelete({ trillerId }).lean();
  return toPublicTriller(deleted);
};

module.exports = {
  listTrillers,
  getTrillerById,
  createTriller,
  updateTriller,
  deleteTriller,
  toPublicTriller,
};
