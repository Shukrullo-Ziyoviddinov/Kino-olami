/**
 * Rasm yo'lini normalizatsiya qiladi
 * @param {string} path - Rasm yo'li
 * @returns {string}
 */
export const normalizeImagePath = (path) => {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  return `/${path.replace(/^\//, '')}`;
};

/**
 * Tilga qarab matn yoki obyektdan qiymat oladi
 * @param {string|object} text - Matn yoki { uz, ru, ... } obyekti
 * @param {string} lang - Til kodi
 * @returns {string}
 */
export const getLocalizedText = (text, lang) => {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[lang] || text.uz || text.ru || text.en || '';
};

/** 0-99: aniq, 100-999: 100+, 1000+: 1k, 1.1k */
export const formatActionCount = (n) => {
  const num = Number(n) || 0;
  if (num < 100) return String(num);
  if (num < 1000) return num + '+';
  if (num % 1000 === 0) return (num / 1000) + 'k';
  return (num / 1000).toFixed(1) + 'k';
};

/**
 * Yosh badge uchun raqam.
 * ageRestriction yoki specs.ageRating ("16+") dan o‘qiydi.
 */
export const getMovieAgeRestriction = (movie) => {
  if (!movie || typeof movie !== 'object') return null;
  const candidates = [movie.ageRestriction, movie.specs?.ageRating];
  for (const value of candidates) {
    if (value == null || value === '') continue;
    const parsed = Number.parseInt(String(value).replace(/[^\d]/g, ''), 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
};
