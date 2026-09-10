const multer = require("multer");

const IMAGE_MAX_BYTES =
  Math.max(1, Number(process.env.UPLOAD_IMAGE_MAX_MB) || 10) * 1024 * 1024;

const VIDEO_MAX_BYTES =
  Math.max(1, Number(process.env.UPLOAD_VIDEO_MAX_MB) || 200) * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
]);

const storage = multer.memoryStorage();

function createFileFilter(allowedMimeTypes, label) {
  return (_req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase().trim();
    const ok =
      allowedMimeTypes.has(mime) ||
      (label === "image" && mime.startsWith("image/")) ||
      (label === "video" && mime.startsWith("video/")) ||
      (label === "media" &&
        (mime.startsWith("image/") || mime.startsWith("video/")));

    if (!ok) {
      const error = new Error(
        `Ruxsat etilmagan fayl turi: ${mime || "noma'lum"}. Faqat ${label} yuklash mumkin.`
      );
      error.statusCode = 400;
      return cb(error);
    }

    return cb(null, true);
  };
}

const uploadImage = multer({
  storage,
  limits: { fileSize: IMAGE_MAX_BYTES, files: 1 },
  fileFilter: createFileFilter(IMAGE_MIME_TYPES, "image"),
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: VIDEO_MAX_BYTES, files: 1 },
  fileFilter: createFileFilter(VIDEO_MIME_TYPES, "video"),
});

const uploadMedia = multer({
  storage,
  limits: { fileSize: VIDEO_MAX_BYTES, files: 1 },
  fileFilter: createFileFilter(
    new Set([...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES]),
    "media"
  ),
});

/** Bitta fayl: form field nomi — `file` */
const uploadImageSingle = uploadImage.single("file");
const uploadVideoSingle = uploadVideo.single("file");
const uploadMediaSingle = uploadMedia.single("file");

function handleMulterError(err, _req, res, next) {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        ok: false,
        data: null,
        message: "Fayl hajmi ruxsat etilgan limittan oshib ketdi.",
      });
    }

    return res.status(400).json({
      success: false,
      ok: false,
      data: null,
      message: err.message || "Fayl yuklashda xatolik.",
    });
  }

  if (err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      ok: false,
      data: null,
      message: err.message || "Fayl yuklashda xatolik.",
    });
  }

  return next(err);
}

module.exports = {
  uploadImage,
  uploadVideo,
  uploadMedia,
  uploadImageSingle,
  uploadVideoSingle,
  uploadMediaSingle,
  handleMulterError,
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
};
