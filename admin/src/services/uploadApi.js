const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

/** Backend allowlist bilan mos folderlar */
export const UPLOAD_FOLDERS = Object.freeze({
  movies: "movies",
  actors: "actors",
  banners: "banners",
  genres: "genres",
  news: "news",
  trillers: "trillers",
  ads: "ads",
  socialLink: "socialLink",
  avatarsUsers: "avatars/users",
  temp: "temp",
  cache: "cache",
});

function normalizeFolder(folder) {
  const value = String(folder || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");

  if (!value || value.includes("..")) {
    throw new Error("Noto'g'ri upload folder.");
  }

  return value;
}

function parseUploadResponse(payload, httpOk) {
  if (!httpOk || payload?.success === false || payload?.ok === false) {
    throw new Error(payload?.message || "Faylni R2 ga yuklashda xatolik yuz berdi.");
  }

  const data = payload?.data || null;
  const url = data?.url ? String(data.url) : "";
  if (!url) {
    throw new Error("Server R2 URL qaytarmadi.");
  }

  return {
    url,
    key: data.key || "",
    folder: data.folder || "",
    contentType: data.contentType || "",
    size: Number(data.size) || 0,
  };
}

function uploadWithXhr(file, folder, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", `${API_BASE}/api/upload/${folder}`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress?.(percent);
    };

    xhr.onload = () => {
      try {
        const payload =
          xhr.response && typeof xhr.response === "object"
            ? xhr.response
            : JSON.parse(xhr.responseText || "{}");
        resolve(parseUploadResponse(payload, xhr.status >= 200 && xhr.status < 300));
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Server javobini o'qib bo'lmadi."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Server bilan ulanishda xatolik yuz berdi."));
    };

    xhr.send(formData);
  });
}

async function uploadWithFetch(file, folder) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/upload/${folder}`, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  const payload = await response.json().catch(() => ({}));
  return parseUploadResponse(payload, response.ok);
}

/**
 * Faylni Cloudflare R2 ga yuklaydi (FormData → POST /api/upload/:folder).
 * @param {File|Blob} file
 * @param {string} folder — masalan "banners", "ads", "avatars/users"
 * @param {{ onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<{ url: string, key: string, folder: string, contentType: string, size: number }>}
 */
export async function uploadToR2(file, folder, options = {}) {
  if (!file) {
    throw new Error("Fayl tanlanmagan.");
  }

  const targetFolder = normalizeFolder(folder);
  const onProgress = typeof options.onProgress === "function" ? options.onProgress : null;

  if (onProgress) {
    onProgress(0);
    const result = await uploadWithXhr(file, targetFolder, onProgress);
    onProgress(100);
    return result;
  }

  return uploadWithFetch(file, targetFolder);
}

/**
 * Faqat public URL kerak bo'lganda.
 * @returns {Promise<string>}
 */
export async function uploadToR2Url(file, folder, options = {}) {
  const result = await uploadToR2(file, folder, options);
  return result.url;
}
