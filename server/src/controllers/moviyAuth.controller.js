const { createHash, randomBytes } = require("node:crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const MoviyIdentity = require("../models/MoviyIdentity");
const MovieComment = require("../models/movieComment");
const { success, fail } = require("../utils/apiResponse");
const { comparePassword } = require("../utils/hash");
const { createToken } = require("../utils/token");

const bridgePhone = (subject) => `moviy:${createHash("sha256").update(subject).digest("hex")}`;
const embedToken = (userId, moviySubject) => createToken({ userId: String(userId), moviySubject }, "15m");

async function findOrCreateIdentity(subject, name, retry = true) {
  const existing = await MoviyIdentity.findById(subject);
  if (existing) return existing;

  const phone = bridgePhone(subject);
  const [firstName, ...rest] = (name || "MoviyAI").trim().split(/\s+/);
  try {
    const user = await User.findOneAndUpdate({ phone }, {
      $setOnInsert: { phone, firstName: firstName || "MoviyAI", lastName: rest.join(" ") || "MoviyAI", password: randomBytes(32).toString("hex") },
    }, { upsert: true, returnDocument: "after" });
    return await MoviyIdentity.findOneAndUpdate({ _id: subject }, {
      $setOnInsert: { userId: user._id },
    }, { upsert: true, returnDocument: "after" });
  } catch (error) {
    if (error.code !== 11000 || !retry) throw error;
    const identity = await MoviyIdentity.findById(subject);
    if (identity) return identity;
    return findOrCreateIdentity(subject, name, false);
  }
}

async function exchange(req, res, next) {
  const secret = process.env.MOVIYAI_SSO_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) return fail(res, "MoviyAI kirishi sozlanmagan.", 503);
  const assertion = req.body?.assertion;
  let claims;
  try {
    claims = jwt.verify(assertion, secret, {
      algorithms: ["HS256"], issuer: "moviyai", audience: "kino-olami", maxAge: "60s",
    });
  } catch {
    return fail(res, "MoviyAI sessiyasi yaroqsiz.", 401);
  }
  if (typeof claims.sub !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(claims.sub)) {
    return fail(res, "MoviyAI sessiyasi yaroqsiz.", 401);
  }
  try {
    const name = typeof claims.name === "string" ? claims.name.slice(0, 160) : "";
    const identity = await findOrCreateIdentity(claims.sub, name);
    res.set("Cache-Control", "no-store");
    return success(res, { token: embedToken(identity.userId, claims.sub) });
  } catch (error) {
    return next(error);
  }
}

async function link(req, res, next) {
  const subject = req.moviySubject;
  if (!subject) return fail(res, "MoviyAI orqali kiring.", 401);
  const { phone, password } = req.body || {};
  if (typeof phone !== "string" || typeof password !== "string" || phone.length > 40 || password.length > 256) {
    return fail(res, "Telefon raqami yoki parol noto‘g‘ri.", 400);
  }
  try {
    const legacy = await User.findOne({ phone: phone.replace(/\D/g, "") });
    if (!legacy || !await comparePassword(password, legacy.password)) {
      return fail(res, "Telefon raqami yoki parol noto‘g‘ri.", 401);
    }
    const result = await mongoose.connection.transaction(async (session) => {
      const identity = await MoviyIdentity.findById(subject).session(session);
      if (!identity) return "conflict";
      if (identity.userId.equals(legacy._id)) return "linked";
      const generated = await User.findOne({ _id: identity.userId, phone: bridgePhone(subject) }).session(session);
      const target = await User.findById(legacy._id).session(session);
      if (!generated || !target || target.password !== legacy.password) return "conflict";
      identity.userId = target._id;
      await identity.save({ session });

      target.wishlist = [...new Set([...target.wishlist, ...generated.wishlist])];
      for (const [id, reaction] of generated.movieReactions || []) {
        if (!target.movieReactions.has(id)) target.movieReactions.set(id, reaction);
      }
      const existingViews = new Set(target.viewedMovies.map((entry) => entry.movieId));
      for (const entry of generated.viewedMovies) {
        if (!existingViews.has(entry.movieId)) target.viewedMovies.push(entry);
      }
      await target.save({ session });
      await MovieComment.updateMany({ authorId: generated._id }, { $set: {
        authorId: target._id, authorName: `${target.firstName} ${target.lastName}`, authorAvatar: target.avatar,
      } }, { session });
      await MovieComment.updateMany({ likedBy: generated._id }, [
        { $set: {
          likedBy: { $setUnion: [{ $setDifference: ["$likedBy", [generated._id]] }, [target._id]] },
          likes: { $cond: [{ $in: [target._id, "$likedBy"] }, { $max: [0, { $subtract: ["$likes", 1] }] }, "$likes"] },
        } },
      ], { session, updatePipeline: true });
      await generated.deleteOne({ session });
      return "linked";
    });
    if (result !== "linked") return fail(res, "Kino Olami hisobi allaqachon bog‘langan.", 409);
    res.set("Cache-Control", "no-store");
    return success(res, { token: embedToken(legacy._id, subject) });
  } catch (error) {
    if (error.code === 11000) return fail(res, "Kino Olami hisobi allaqachon bog‘langan.", 409);
    return next(error);
  }
}

module.exports = { exchange, link };
