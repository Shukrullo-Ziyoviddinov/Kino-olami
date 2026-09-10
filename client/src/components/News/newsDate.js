const pad2 = (n) => String(Number(n) || 0).padStart(2, '0');

/**
 * Sana: createdAt (server timestamps) — admin yaratganda avtomatik.
 * day/month/year API dan kelsa fallback.
 * Ko'rishlar formati: formatNewsViews.
 */
export function getNewsDateParts(item) {
  const raw = item?.createdAt || item?.uploadedAt;
  if (raw) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        date,
      };
    }
  }

  if (item?.day != null && item?.month != null && item?.year != null) {
    return {
      day: Number(item.day),
      month: Number(item.month),
      year: Number(item.year),
      date: null,
    };
  }

  return null;
}

export function formatNewsDate(item) {
  const parts = getNewsDateParts(item);
  if (!parts) return '';
  return `${pad2(parts.day)}.${pad2(parts.month)}.${parts.year}`;
}

export function formatNewsViews(value) {
  const n = Number(value) || 0;
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(n);
}
