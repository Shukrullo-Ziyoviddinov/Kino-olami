const crypto = require("crypto");
const path = require("path");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const {
  r2Client,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
  R2_ENDPOINT,
} = require("../config/r2");

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

function normalizeFolder(folder) {
  const value = String(folder || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");

  if (!value) {
    throw new Error("R2 folder (papka) ko'rsatilishi shart.");
  }

  if (value.includes("..")) {
    throw new Error("R2 folder nomida '..' ruxsat etilmaydi.");
  }

  return value;
}

function normalizeKey(key) {
  return String(key || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
}

function extensionFromName(originalName = "", mimeType = "") {
  const fromName = path.extname(String(originalName || "")).toLowerCase();
  if (fromName && fromName.length <= 10) {
    return fromName;
  }

  const map = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-msvideo": ".avi",
    "video/x-matroska": ".mkv",
  };

  return map[String(mimeType || "").toLowerCase()] || "";
}

function buildObjectKey(folder, originalName, mimeType) {
  const prefix = normalizeFolder(folder);
  const ext = extensionFromName(originalName, mimeType);
  const id = crypto.randomUUID();
  return `${prefix}/${id}${ext}`;
}

/**
 * Bitta joyda URL yig'iladi.
 * R2_PUBLIC_URL (custom domain) qo'yilsa — faqat .env o'zgaradi, kod o'zgarmaydi.
 * Hozircha bo'sh bo'lsa — endpoint + bucket fallback (public access uchun keyin domain ulang).
 */
function getPublicUrl(key) {
  const cleanKey = normalizeKey(key);
  if (!cleanKey) {
    throw new Error("R2 object key bo'sh.");
  }

  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${cleanKey}`;
  }

  const endpoint = String(R2_ENDPOINT || "").replace(/\/+$/, "");
  return `${endpoint}/${R2_BUCKET_NAME}/${cleanKey}`;
}

function extractKeyFromUrlOrKey(keyOrUrl) {
  const raw = String(keyOrUrl || "").trim();
  if (!raw) {
    throw new Error("O'chirish uchun R2 key yoki URL kerak.");
  }

  if (!/^https?:\/\//i.test(raw)) {
    return normalizeKey(raw);
  }

  try {
    const pathname = new URL(raw).pathname.replace(/^\/+/, "");

    if (R2_PUBLIC_URL) {
      const publicPath = new URL(R2_PUBLIC_URL).pathname.replace(/^\/+|\/+$/g, "");
      if (publicPath && pathname.startsWith(`${publicPath}/`)) {
        return normalizeKey(pathname.slice(publicPath.length + 1));
      }
    }

    const bucketPrefix = `${R2_BUCKET_NAME}/`;
    if (pathname.startsWith(bucketPrefix)) {
      return normalizeKey(pathname.slice(bucketPrefix.length));
    }

    return normalizeKey(pathname);
  } catch {
    throw new Error("R2 URL dan key ajratib bo'lmadi.");
  }
}

async function putObject({ buffer, contentType, folder, originalName }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Yuklash uchun fayl buffer bo'sh.");
  }

  const mime = String(contentType || "").toLowerCase().trim();
  if (!mime) {
    throw new Error("Content-Type (mimetype) ko'rsatilishi shart.");
  }

  const key = buildObjectKey(folder, originalName, mime);

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mime,
      })
    );
  } catch (error) {
    const message = error?.message || "Noma'lum xato";
    throw new Error(`R2 ga yuklashda xatolik: ${message}`);
  }

  return {
    key,
    url: getPublicUrl(key),
    contentType: mime,
    size: buffer.length,
  };
}

async function uploadImageToR2({
  buffer,
  mimetype,
  contentType,
  folder,
  originalName,
} = {}) {
  const mime = String(mimetype || contentType || "").toLowerCase().trim();

  if (!IMAGE_MIME_TYPES.has(mime) && !mime.startsWith("image/")) {
    throw new Error(`Ruxsat etilmagan rasm turi: ${mime || "noma'lum"}`);
  }

  return putObject({
    buffer,
    contentType: mime,
    folder,
    originalName,
  });
}

async function uploadVideoToR2({
  buffer,
  mimetype,
  contentType,
  folder,
  originalName,
} = {}) {
  const mime = String(mimetype || contentType || "").toLowerCase().trim();

  if (!VIDEO_MIME_TYPES.has(mime) && !mime.startsWith("video/")) {
    throw new Error(`Ruxsat etilmagan video turi: ${mime || "noma'lum"}`);
  }

  return putObject({
    buffer,
    contentType: mime,
    folder,
    originalName,
  });
}

async function deleteFromR2(keyOrUrl) {
  const key = extractKeyFromUrlOrKey(keyOrUrl);

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    const message = error?.message || "Noma'lum xato";
    throw new Error(`R2 dan o'chirishda xatolik: ${message}`);
  }

  return { key, deleted: true };
}

module.exports = {
  uploadImageToR2,
  uploadVideoToR2,
  deleteFromR2,
  getPublicUrl,
};
