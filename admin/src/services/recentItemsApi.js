const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

function localized(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    return value.uz || value.ru || value.en || '';
  }
  return '';
}

function toImageUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false || payload?.ok === false) {
    throw new Error(payload?.message || 'Maʼlumot olishda xatolik.');
  }
  return payload;
}

async function fetchAllPages(endpoint) {
  const rows = [];
  let page = 1;
  const limit = 100;
  let hasNext = true;
  let safety = 0;

  while (hasNext && safety < 30) {
    const response = await fetch(`${API_BASE}${endpoint}?page=${page}&limit=${limit}`, {
      headers: { Accept: 'application/json' },
    });
    const payload = await readJson(response);
    rows.push(...(Array.isArray(payload?.data) ? payload.data : []));
    hasNext = Boolean(payload?.meta?.hasNextPage);
    page += 1;
    safety += 1;
  }

  return rows;
}

function sortNewestFirst(items) {
  return [...items].sort((a, b) => {
    const da = new Date(a.createdAt || 0).getTime();
    const db = new Date(b.createdAt || 0).getTime();
    if (db !== da) return db - da;

    const ia = Number(a.id || a.movieId || a.actorId || a.bannerId || a.adId || 0);
    const ib = Number(b.id || b.movieId || b.actorId || b.bannerId || b.adId || 0);
    return ib - ia;
  });
}

function collapseLocalizedRows(rows, getKey) {
  const grouped = new Map();
  rows.forEach((row) => {
    const key = String(getKey(row));
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, row);
      return;
    }

    const currentLang = String(current.lang || '').toLowerCase();
    const rowLang = String(row.lang || '').toLowerCase();

    // UZ variant ustun, bo'lmasa eng yangi obyekt qoladi
    if (currentLang !== 'uz' && rowLang === 'uz') {
      grouped.set(key, row);
      return;
    }
    if (rowLang === currentLang) {
      const currentTs = new Date(current.createdAt || 0).getTime();
      const rowTs = new Date(row.createdAt || 0).getTime();
      if (rowTs > currentTs) grouped.set(key, row);
    }
  });
  return [...grouped.values()];
}

export async function fetchRecentItems() {
  const [movies, actors, banners, ads, genres] = await Promise.all([
    fetchAllPages('/api/movies'),
    fetchAllPages('/api/actors'),
    fetchAllPages('/api/banners'),
    fetchAllPages('/api/ads'),
    fetchAllPages('/api/genres'),
  ]);

  const movieTitleById = new Map(
    movies.map((movie) => [
      Number(movie.id ?? movie.movieId),
      {
        uz: localized(movie.title?.uz ?? movie.title),
        ru: localized(movie.title?.ru ?? movie.title),
      },
    ])
  );

  const collapsedBanners = collapseLocalizedRows(
    banners,
    (item) => `${item.movieId ?? ''}-${item.sortOrder ?? ''}`
  );

  const collapsedMovies = collapseLocalizedRows(
    movies,
    (item) => item.id ?? item.movieId ?? item._id ?? ''
  );

  const collapsedActors = collapseLocalizedRows(
    actors,
    (item) => item.actorId ?? item._id ?? ''
  );

  const collapsedAds = collapseLocalizedRows(
    ads,
    (item) => item.adId ?? item._id ?? ''
  );

  const collapsedGenres = collapseLocalizedRows(
    genres,
    (item) => item.genreId ?? item._id ?? ''
  );

  return {
    movies: sortNewestFirst(
      collapsedMovies.map((item) => ({
        id: item.id ?? item.movieId,
        section: 'movies',
        title: localized(item.title),
        subtitle: localized(item.title?.ru),
        image: toImageUrl(localized(item.homeImg) || item.image || item.poster),
        createdAt: item.createdAt,
        raw: item,
      }))
    ),
    actors: sortNewestFirst(
      collapsedActors.map((item) => ({
        id: item.actorId,
        section: 'actors',
        title: localized(item.name),
        subtitle: localized(item.name?.ru),
        image: toImageUrl(item.image),
        createdAt: item.createdAt,
        raw: item,
      }))
    ),
    banners: sortNewestFirst(
      collapsedBanners.map((item) => ({
        id: item.bannerId,
        section: 'banners',
        title: movieTitleById.get(Number(item.movieId))?.uz || '',
        subtitle: movieTitleById.get(Number(item.movieId))?.ru || '',
        image: toImageUrl(item.image),
        createdAt: item.createdAt,
        raw: item,
      }))
    ),
    ads: sortNewestFirst(
      collapsedAds.map((item) => ({
        id: item.adId,
        section: 'ads',
        title: 'Reklama',
        subtitle: '',
        image: '',
        createdAt: item.createdAt,
        raw: item,
      }))
    ),
    genres: sortNewestFirst(
      collapsedGenres.map((item) => ({
        id: item.genreId,
        section: 'genres',
        title: localized(item.title),
        subtitle: localized(item.title?.ru),
        image: toImageUrl(item.img),
        createdAt: item.createdAt,
        raw: item,
      }))
    ),
  };
}
