const assert = require("node:assert/strict");
const { test } = require("node:test");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Identity = require("../src/models/MoviyIdentity");
const Comment = require("../src/models/movieComment");
const { exchange, link } = require("../src/controllers/moviyAuth.controller");
const { hashPassword } = require("../src/utils/hash");
const { verifyToken } = require("../src/utils/token");

const secret = "moviy-test-secret-at-least-32-bytes";
const env = { MOVIYAI_SSO_SECRET: secret, JWT_SECRET: "kino-test-jwt-secret" };

function response() {
  return {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    set(name, value) { this.headers[name] = value; return this; },
    json(body) { this.body = body; return this; },
  };
}

function sign(overrides = {}, signingKey = secret) {
  return jwt.sign({ name: "Test Viewer" }, signingKey, {
    issuer: "moviyai", audience: "kino-olami", subject: "moviy-user-1", expiresIn: "60s",
    ...overrides,
  });
}

test("rejects tampered, expired and wrong-audience assertions before accessing MongoDB", async (t) => {
  t.mock.method(Identity, "findById", () => assert.fail("Invalid ticket accessed MongoDB"));
  const originalSecret = process.env.MOVIYAI_SSO_SECRET;
  process.env.MOVIYAI_SSO_SECRET = secret;
  t.after(() => {
    if (originalSecret === undefined) delete process.env.MOVIYAI_SSO_SECRET;
    else process.env.MOVIYAI_SSO_SECRET = originalSecret;
  });
  for (const assertion of [sign({}, "different-test-signing-key"), sign({ expiresIn: "-1s" }), sign({ audience: "other-site" })]) {
    const res = response();
    await exchange({ body: { assertion } }, res, assert.fail);
    assert.equal(res.statusCode, 401);
  }
});

test("reuses the same Kino Olami identity and returns only a short-lived Kino token", async (t) => {
  const previous = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
  Object.assign(process.env, env);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  let identity;
  t.mock.method(Identity, "findById", async () => identity);
  const createUser = t.mock.method(User, "findOneAndUpdate", async (_filter, update) => {
    assert.match(update.$setOnInsert.phone, /^moviy:[a-f0-9]{64}$/);
    return { _id: "kino-user-1" };
  });
  t.mock.method(Identity, "findOneAndUpdate", async (filter, update) => {
    identity = { _id: filter._id, userId: update.$setOnInsert.userId };
    return identity;
  });
  for (let i = 0; i < 2; i += 1) {
    const res = response();
    await exchange({ body: { assertion: sign() } }, res, assert.fail);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers["Cache-Control"], "no-store");
    const session = verifyToken(res.body.data.token);
    assert.equal(session.userId, "kino-user-1");
    assert.equal(session.moviySubject, "moviy-user-1");
    assert.equal(session.exp - session.iat, 900);
  }
  assert.equal(createUser.mock.callCount(), 1);
});

test("link requires the old password and merges saved films before issuing a replacement token", async (t) => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = env.JWT_SECRET;
  t.after(() => {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  });
  const password = "fixture-password";
  const legacy = {
    _id: new mongoose.Types.ObjectId(),
    password: await hashPassword(password),
    firstName: "Old", lastName: "Viewer",
    wishlist: [1, 2], movieReactions: new Map([["1", "like"]]), viewedMovies: [],
    save: async () => {},
  };
  const generated = {
    _id: new mongoose.Types.ObjectId(),
    wishlist: [2, 3], movieReactions: new Map([["1", "dislike"], ["3", "like"]]), viewedMovies: [],
    deleteOne: async () => {},
  };
  const identity = { userId: generated._id, save: async () => {} };
  const query = (doc) => ({ session: async () => doc });
  t.mock.method(User, "findOne", (filter) => filter.phone === "998901234567" ? legacy : query(generated));
  t.mock.method(User, "findById", () => query(legacy));
  t.mock.method(Identity, "findById", () => query(identity));
  t.mock.method(Comment, "updateMany", async () => {});
  const transaction = t.mock.method(mongoose.connection, "transaction", (callback) => callback({}));

  const rejected = response();
  await link({ moviySubject: "moviy-user-1", body: { phone: "998901234567", password: "wrong" } }, rejected, assert.fail);
  assert.equal(rejected.statusCode, 401);
  assert.equal(transaction.mock.callCount(), 0);

  const res = response();
  await link({ moviySubject: "moviy-user-1", body: { phone: "998901234567", password } }, res, assert.fail);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(legacy.wishlist, [1, 2, 3]);
  assert.deepEqual([...legacy.movieReactions], [["1", "like"], ["3", "like"]]);
  assert.equal(identity.userId, legacy._id);
  assert.equal(verifyToken(res.body.data.token).userId, String(legacy._id));
});
