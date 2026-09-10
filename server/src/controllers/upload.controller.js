const { success, fail } = require("../utils/apiResponse");
const {
  uploadImageToR2,
  uploadVideoToR2,
} = require("../services/r2Service");

/** R2 key prefiksi + qabul qilinadigan media turi */
const UPLOAD_FOLDERS = {
  movies: { folder: "movies", kind: "media" },
  actors: { folder: "actors", kind: "image" },
  banners: { folder: "banners", kind: "image" },
  genres: { folder: "genres", kind: "image" },
  news: { folder: "news", kind: "image" },
  trillers: { folder: "trillers", kind: "image" },
  ads: { folder: "ads", kind: "video" },
  socialLink: { folder: "socialLink", kind: "image" },
  "avatars/users": { folder: "avatars/users", kind: "image" },
  temp: { folder: "temp", kind: "media" },
  cache: { folder: "cache", kind: "media" },
};

function resolveFolderConfig(rawFolder) {
  const key = String(rawFolder || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");

  if (!key || key.includes("..")) {
    return null;
  }

  // /api/upload/avatars → avatars/users
  if (key === "avatars") {
    return UPLOAD_FOLDERS["avatars/users"];
  }

  return UPLOAD_FOLDERS[key] || null;
}

function isImageMime(mime) {
  return String(mime || "").toLowerCase().startsWith("image/");
}

function isVideoMime(mime) {
  return String(mime || "").toLowerCase().startsWith("video/");
}

async function uploadToFolder(req, res, next) {
  try {
    const config = resolveFolderConfig(req.params.folder);
    if (!config) {
      return fail(
        res,
        "Noto'g'ri folder. Ruxsat: movies, actors, banners, genres, news, trillers, ads, socialLink, avatars/users, temp, cache",
        400
      );
    }

    const file = req.file;
    if (!file || !file.buffer) {
      return fail(res, "Fayl topilmadi. Form-data da `file` maydonini yuboring.", 400);
    }

    const mime = String(file.mimetype || "").toLowerCase();

    if (config.kind === "image" && !isImageMime(mime)) {
      return fail(res, "Bu folder uchun faqat rasm yuklash mumkin.", 400);
    }
    if (config.kind === "video" && !isVideoMime(mime)) {
      return fail(res, "Bu folder uchun faqat video yuklash mumkin.", 400);
    }
    if (config.kind === "media" && !isImageMime(mime) && !isVideoMime(mime)) {
      return fail(res, "Faqat rasm yoki video yuklash mumkin.", 400);
    }

    const payload = {
      buffer: file.buffer,
      mimetype: mime,
      folder: config.folder,
      originalName: file.originalname,
    };

    const result = isVideoMime(mime)
      ? await uploadVideoToR2(payload)
      : await uploadImageToR2(payload);

    return success(
      res,
      {
        url: result.url,
        key: result.key,
        folder: config.folder,
        contentType: result.contentType,
        size: result.size,
      },
      "Fayl R2 ga yuklandi",
      201
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  UPLOAD_FOLDERS,
  resolveFolderConfig,
  uploadToFolder,
};
