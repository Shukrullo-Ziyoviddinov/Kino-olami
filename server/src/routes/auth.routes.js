const express = require("express");
const { register, login, logout } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const moviyAuth = require("../controllers/moviyAuth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/moviy/exchange", moviyAuth.exchange);
router.post("/moviy/link", authMiddleware, moviyAuth.link);

module.exports = router;
