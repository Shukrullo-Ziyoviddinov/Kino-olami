/**
 * title bo'yicha qidiruv + o'xshashlar (filterGenre, filterCountry, typeCategory)
 * So'zma-so'z va imlo xatolariga chidamli (fuzzy)
 * Backenddan olingan movies list bilan ishlaydi
 */

const normalize = (s) => (s || '').toLowerCase().trim();

const getTitleForLang = (movie, lang) => {
  if (!movie?.title) return '';
  if (typeof movie.title === 'object') {
    return movie.title[lang] || movie.title.uz || movie.title.ru || '';
  }
  return String(movie.title);
};

const levenshtein = (a, b) => {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
};

const fuzzyMatch = (queryWord, titleWord) => {
  if (!queryWord || queryWord.length < 2) return false;
  if (titleWord.includes(queryWord) || queryWord.includes(titleWord)) return true;
  if (queryWord.length >= 3 && titleWord.length >= 3) {
    const d = levenshtein(queryWord, titleWord);
    const maxDist = queryWord.length <= 4 ? 1 : Math.min(2, Math.floor(queryWord.length / 2));
    return d <= maxDist;
  }
  return false;
};

const titleMatchesQuery = (titleUz, titleRu, queryWords) => {
  const titleWordsUz = titleUz.split(/\s+/).filter(Boolean);
  const titleWordsRu = titleRu.split(/\s+/).filter(Boolean);
  for (const qw of queryWords) {
    if (qw.length < 2) continue;
    const inUz = titleWordsUz.some((tw) => fuzzyMatch(qw, tw)) || titleUz.includes(qw);
    const inRu = titleWordsRu.some((tw) => fuzzyMatch(qw, tw)) || titleRu.includes(qw);
    if (inUz || inRu) return true;
  }
  return false;
};

const metaMatchesQuery = (movie, queryWords) => {
  for (const qw of queryWords) {
    if (qw.length < 2) continue;
    const genres = Array.isArray(movie.filterGenre) ? movie.filterGenre : movie.filterGenre ? [movie.filterGenre] : [];
    for (const g of genres) {
      if (fuzzyMatch(qw, normalize(g))) return true;
    }
    if (movie.filterCountry && fuzzyMatch(qw, normalize(movie.filterCountry))) return true;
    const types = Array.isArray(movie.typeCategory) ? movie.typeCategory : movie.typeCategory ? [movie.typeCategory] : [];
    for (const t of types) {
      if (fuzzyMatch(qw, normalize(String(t)))) return true;
    }
  }
  return false;
};

const titleMatchScore = (movie, q, queryWords) => {
  const titleUz = normalize(getTitleForLang(movie, 'uz'));
  const titleRu = normalize(getTitleForLang(movie, 'ru'));
  if (titleUz.includes(q) || titleRu.includes(q)) return 2; // aniq sarlavha
  if (titleMatchesQuery(titleUz, titleRu, queryWords)) return 1; // so'zma-so'z/fuzzy
  return 0;
};

export const searchMoviesByQuery = (movies, query, contentLang = 'uz', limit = 20) => {
  const q = normalize(query);
  if (!q) return [];

  const queryWords = q.split(/\s+/).filter((w) => w.length >= 1);

  const byTitle = [];
  const byMeta = [];

  for (const m of movies || []) {
    const score = titleMatchScore(m, q, queryWords);
    if (score > 0) byTitle.push({ movie: m, score });
    else if (metaMatchesQuery(m, queryWords)) byMeta.push(m);
  }

  byTitle.sort((a, b) => b.score - a.score);
  const titleMovies = byTitle.map((x) => x.movie);
  const titleIds = new Set(titleMovies.map((m) => m.id));
  const metaOnly = byMeta.filter((m) => !titleIds.has(m.id));

  return [...titleMovies, ...metaOnly].slice(0, limit);
};
