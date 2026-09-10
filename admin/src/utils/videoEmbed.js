/**
 * YouTube / Mover.uz / VK Video havolalaridan (yoki iframe HTML dan) embed URL yasaydi.
 */

const VK_HOSTS = new Set([
  'vk.com',
  'm.vk.com',
  'vk.ru',
  'm.vk.ru',
  'vkvideo.ru',
  'm.vkvideo.ru',
]);

/**
 * Input URL yoki <iframe src="..."> bo‘lishi mumkin — toza URL qaytaradi.
 */
export function extractVideoInputUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';

  // To‘liq yoki qisman iframe HTML
  if (/<iframe[\s>]/i.test(raw) || /src\s*=/i.test(raw)) {
    const match =
      raw.match(/<iframe[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i) ||
      raw.match(/\bsrc\s*=\s*["'](https?:\/\/[^"']+)["']/i) ||
      raw.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (match?.[1]) {
      return match[1]
        .trim()
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'");
    }
  }

  return raw;
}

export function getYouTubeVideoId(url) {
  const raw = extractVideoInputUrl(url);
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0] || '';
      return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 11);
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v) return v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 11);

      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'v') {
        return (parts[1] || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 11);
      }
    }
  } catch {
    /* ignore */
  }

  return '';
}

/**
 * Mover: /watch/ID, /video/embed/ID
 */
export function getMoverVideoId(url) {
  const raw = extractVideoInputUrl(url);
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host !== 'mover.uz') return '';

    const parts = parsed.pathname.split('/').filter(Boolean);
    // /watch/mXqLYRt5
    if (parts[0] === 'watch' && parts[1]) {
      return parts[1].replace(/[^a-zA-Z0-9_-]/g, '');
    }
    // /video/embed/mXqLYRt5
    if (parts[0] === 'video' && parts[1] === 'embed' && parts[2]) {
      return parts[2].replace(/[^a-zA-Z0-9_-]/g, '');
    }
  } catch {
    /* ignore */
  }

  return '';
}

/**
 * video-123_456 → oid=-123, id=456
 * video123_456  → oid=123, id=456
 */
function parseVkVideoToken(token) {
  const raw = String(token || '').trim();
  if (!raw) return null;

  const match = raw.match(/^(?:video|clip)?(-?\d+)_(\d+)$/i);
  if (!match) return null;

  return {
    oid: String(match[1]),
    id: String(match[2]),
  };
}

/**
 * @returns {{ oid: string, id: string, hash?: string, hd?: string } | null}
 */
export function getVkVideoParams(url) {
  const raw = extractVideoInputUrl(url);
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (!VK_HOSTS.has(host)) return null;

    // https://vkvideo.ru/video_ext.php?oid=-123&id=456&hash=abc&hd=2
    if (parsed.pathname.toLowerCase().includes('video_ext.php')) {
      const oid = parsed.searchParams.get('oid');
      const id = parsed.searchParams.get('id');
      if (!oid || !id) return null;
      const hash = parsed.searchParams.get('hash') || undefined;
      const hd = parsed.searchParams.get('hd') || undefined;
      return { oid: String(oid), id: String(id), hash, hd };
    }

    // ?z=video-123_456 / clip-123_456
    const z = parsed.searchParams.get('z') || '';
    const zMatch = z.match(/^(?:video|clip)(-?\d+_\d+)/i);
    if (zMatch) {
      const parsedToken = parseVkVideoToken(zMatch[1]);
      if (parsedToken) return parsedToken;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    for (const part of parts) {
      // video-123_456 | clip-123_456 | video123_456
      const named = part.match(/^(?:video|clip)(-?\d+_\d+)$/i);
      if (named) {
        const parsedToken = parseVkVideoToken(named[1]);
        if (parsedToken) return parsedToken;
      }

      const bare = parseVkVideoToken(part);
      if (bare) return bare;
    }
  } catch {
    /* ignore */
  }

  return null;
}

export function isYouTubeUrl(url) {
  return Boolean(getYouTubeVideoId(url));
}

export function isMoverUrl(url) {
  return Boolean(getMoverVideoId(url));
}

export function isVkUrl(url) {
  return Boolean(getVkVideoParams(url));
}

export function getYouTubeEmbedUrl(url, { autoplay = false } = {}) {
  const id = getYouTubeVideoId(url);
  if (!id) return '';
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (autoplay) params.set('autoplay', '1');
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function getMoverEmbedUrl(url) {
  const id = getMoverVideoId(url);
  if (!id) return '';
  return `https://mover.uz/video/embed/${id}`;
}

export function getVkEmbedUrl(url, { autoplay = false } = {}) {
  const params = getVkVideoParams(url);
  if (!params) return '';

  const query = new URLSearchParams({
    oid: params.oid,
    id: params.id,
  });
  if (params.hash) query.set('hash', params.hash);
  if (params.hd) query.set('hd', params.hd);
  if (autoplay) query.set('autoplay', '1');

  return `https://vkvideo.ru/video_ext.php?${query.toString()}`;
}

/**
 * @returns {{ provider: 'youtube'|'mover'|'vk', embedUrl: string } | null}
 */
export function getVideoEmbed(url, options = {}) {
  const raw = extractVideoInputUrl(url);
  if (!raw) return null;

  if (isYouTubeUrl(raw)) {
    return {
      provider: 'youtube',
      embedUrl: getYouTubeEmbedUrl(raw, options),
    };
  }

  if (isMoverUrl(raw)) {
    return {
      provider: 'mover',
      embedUrl: getMoverEmbedUrl(raw),
    };
  }

  if (isVkUrl(raw)) {
    return {
      provider: 'vk',
      embedUrl: getVkEmbedUrl(raw, options),
    };
  }

  return null;
}

export function isEmbeddableVideoUrl(url) {
  return Boolean(getVideoEmbed(url));
}

/**
 * Iframe/URL ni toza saqlash uchun: embed URL bo‘lsa uni, aks holda asl matn.
 */
export function normalizeVideoSource(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  const embed = getVideoEmbed(raw)?.embedUrl;
  return embed || extractVideoInputUrl(raw) || raw;
}
