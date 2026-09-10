const express = require("express");
const newsController = require("../controllers/news.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", newsController.list);
router.get("/layout", newsController.layout);
router.post("/:newsId/view", authMiddleware, newsController.registerView);
router.get("/:newsId", newsController.getById);
router.post("/", newsController.create);
router.put("/:newsId", newsController.update);
router.delete("/:newsId", newsController.remove);

module.exports = router;
