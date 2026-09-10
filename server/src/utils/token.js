const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET .env faylda topilmadi.");
  }
  return secret;
};

const createToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  createToken,
  verifyToken,
};
