const express = require("express");
const trillerController = require("../controllers/triller.controller");

const router = express.Router();

router.get("/", trillerController.list);
router.get("/:trillerId", trillerController.getById);
router.post("/", trillerController.create);
router.put("/:trillerId", trillerController.update);
router.delete("/:trillerId", trillerController.remove);

module.exports = router;
