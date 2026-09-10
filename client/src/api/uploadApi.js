import { BASE_URL } from '../config/api';
import { createApiError, normalizeApiError } from '../utils/errorHandler';

const getBase = () => BASE_URL.replace(/\/$/, '');
const toUrl = (path) => `${getBase()}${path.startsWith('/') ? path : `/${path}`}`;

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch (_error) {
    return null;
  }
};

/**
 * Faylni Cloudflare R2 ga yuklaydi.
 * @param {File|Blob} file
 * @param {string} folder — masalan "avatars/users"
 * @returns {Promise<{ url: string, key: string, folder: string, contentType: string, size: number }>}
 */
export const uploadToR2 = async (file, folder) => {
  try {
    if (!file) {
      throw createApiError('Fayl tanlanmagan.', 400);
    }

    const targetFolder = String(folder || '')
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\/+|\/+$/g, '');

    if (!targetFolder || targetFolder.includes('..')) {
      throw createApiError("Noto'g'ri upload folder.", 400);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(toUrl(`/api/upload/${targetFolder}`), {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });

    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }

    const data = json?.data || null;
    const url = data?.url ? String(data.url) : '';
    if (!url) {
      throw createApiError('Server R2 URL qaytarmadi.', 500);
    }

    return {
      url,
      key: data.key || '',
      folder: data.folder || targetFolder,
      contentType: data.contentType || '',
      size: Number(data.size) || 0,
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const UPLOAD_FOLDERS = Object.freeze({
  avatarsUsers: 'avatars/users',
});
