const User = require("../models/User");
const { verifyToken } = require("../utils/token");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      const error = new Error("Avtorizatsiya talab qilinadi.");
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      const error = new Error("Foydalanuvchi topilmadi.");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    return next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Token yaroqsiz yoki muddati tugagan.";
    }
    return next(error);
  }
};

module.exports = authMiddleware;
