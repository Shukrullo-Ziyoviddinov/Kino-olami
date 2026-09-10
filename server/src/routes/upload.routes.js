const express = require("express");
const { fail } = require("../utils/apiResponse");
const {
  uploadImageSingle,
  uploadVideoSingle,
  uploadMediaSingle,
  handleMulterError,
} = require("../middlewares/upload.middleware");
const {
  resolveFolderConfig,
  uploadToFolder,
} = require("../controllers/upload.controller");

const router = express.Router();

function pickMulterByKind(kind) {
  if (kind === "video") return uploadVideoSingle;
  if (kind === "media") return uploadMediaSingle;
  return uploadImageSingle;
}

/**
 * Multer ni folder turiga qarab tanlaydi, so'ng R2 ga yuklaydi.
 * POST /api/upload/:folder
 * POST /api/upload/avatars/users
 * Form-data: file=<binary>
 */
function uploadByFolderParam(req, res, next) {
  const config = resolveFolderConfig(req.params.folder);
  if (!config) {
    return fail(
      res,
      "Noto'g'ri folder. Ruxsat: movies, actors, banners, genres, news, trillers, ads, socialLink, avatars/users, temp, cache",
      400
    );
  }

  const uploadMiddleware = pickMulterByKind(config.kind);

  uploadMiddleware(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    return uploadToFolder(req, res, next);
  });
}

// Nested path avval (avatars/users)
router.post("/avatars/users", (req, res, next) => {
  req.params.folder = "avatars/users";
  return uploadByFolderParam(req, res, next);
});

router.post("/:folder", uploadByFolderParam);

module.exports = router;
