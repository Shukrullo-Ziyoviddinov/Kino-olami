const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET .env faylda topilmadi.");
  }
  return secret;
};

const createToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  createToken,
  verifyToken,
};
