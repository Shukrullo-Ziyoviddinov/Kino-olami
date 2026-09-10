const User = require("../models/User");
const { success } = require("../utils/apiResponse");
const { hashPassword, comparePassword } = require("../utils/hash");
const { createToken } = require("../utils/token");

const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

const toUserPayload = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  avatar: user.avatar || null,
});

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET .env faylda topilmadi.");
    error.statusCode = 500;
    throw error;
  }
};

const register = async (req, res, next) => {
  try {
    ensureJwtSecret();
    const { firstName, lastName, phone, password, avatar } = req.body || {};

    if (!firstName || !lastName || !phone || !password) {
      const error = new Error("Barcha majburiy maydonlarni to'ldiring.");
      error.statusCode = 400;
      throw error;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      const error = new Error("Telefon raqami noto'g'ri.");
      error.statusCode = 400;
      throw error;
    }

    const exists = await User.findOne({ phone: normalizedPhone });
    if (exists) {
      const error = new Error("Bu telefon raqam allaqachon ro'yxatdan o'tgan.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(String(password));
    const user = await User.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      phone: normalizedPhone,
      password: hashedPassword,
      avatar: avatar || null,
    });

    const token = createToken({ userId: String(user._id) });

    return success(
      res,
      { token, user: toUserPayload(user) },
      "Ro'yxatdan muvaffaqiyatli o'tildi.",
      201
    );
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    ensureJwtSecret();
    const { phone, password } = req.body || {};
    if (!phone || !password) {
      const error = new Error("Telefon raqam va parol majburiy.");
      error.statusCode = 400;
      throw error;
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      const error = new Error("Telefon raqam yoki parol noto'g'ri.");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(String(password), user.password);
    if (!isMatch) {
      const error = new Error("Telefon raqam yoki parol noto'g'ri.");
      error.statusCode = 401;
      throw error;
    }

    const token = createToken({ userId: String(user._id) });

    return success(res, { token, user: toUserPayload(user) }, "Muvaffaqiyatli kirildi.");
  } catch (error) {
    return next(error);
  }
};

const logout = async (_req, res, next) => {
  try {
    return success(res, null, "Profildan chiqildi.");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
};
