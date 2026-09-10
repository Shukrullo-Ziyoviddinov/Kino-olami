/**
 * Bot ichida kino nomiga qarab qidirish (inline emas — oddiy chat matni).
 */

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function fuzzyMatch(queryWord, targetWord) {
  if (!queryWord || !targetWord || queryWord.length < 2) {
    return false;
  }

  if (targetWord.includes(queryWord) || queryWord.includes(targetWord)) {
    return true;
  }

  if (queryWord.length >= 3 && targetWord.length >= 3) {
    const distance = levenshtein(queryWord, targetWord);
    const maxDistance =
      queryWord.length <= 4 ? 1 : Math.min(2, Math.floor(queryWord.length / 2));
    return distance <= maxDistance;
  }

  return false;
}

function titleMatchScore(movie, q, queryWords) {
  const titleUz = normalize(movie?.title?.uz);
  const titleRu = normalize(movie?.title?.ru);

  if (titleUz.includes(q) || titleRu.includes(q)) {
    return 3;
  }

  const titleWords = `${titleUz} ${titleRu}`.split(/\s+/).filter(Boolean);
  for (const queryWord of queryWords) {
    if (queryWord.length < 2) continue;
    if (titleWords.some((word) => fuzzyMatch(queryWord, word))) {
      return 2;
    }
  }

  return 0;
}

function metaMatchScore(movie, language, queryWords) {
  const details =
    movie?.description?.[language] ||
    movie?.description?.uz ||
    movie?.description?.ru ||
    {};
  const genres =
    details?.genre ||
    movie?.genre?.[language] ||
    movie?.genre?.uz ||
    movie?.genre?.ru ||
    [];

  const haystackItems = [
    movie?.movieCode,
    details?.country,
    details?.year,
    details?.duration,
    ...(Array.isArray(genres) ? genres : [genres]),
  ]
    .filter(Boolean)
    .map((item) => normalize(item));

  let hits = 0;
  for (const queryWord of queryWords) {
    if (queryWord.length < 2) continue;
    if (haystackItems.some((item) => fuzzyMatch(queryWord, item) || item.includes(queryWord))) {
      hits += 1;
    }
  }

  return hits > 0 ? 1 : 0;
}

function filterMoviesByQuery(movies, queryText, language) {
  const needle = normalize(queryText);
  if (!needle) return [];

  const onlySymbols = !/[a-zA-Z0-9\u0400-\u04FF\u0600-\u06FF]/.test(needle);
  if (onlySymbols) return [];

  const queryWords = needle.split(/\s+/).filter(Boolean);
  const scored = [];

  for (const movie of movies) {
    const titleScore = titleMatchScore(movie, needle, queryWords);
    const metaScore = metaMatchScore(movie, language, queryWords);
    const totalScore = titleScore + metaScore;
    if (totalScore > 0) {
      scored.push({ movie, totalScore });
    }
  }

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored.map((item) => item.movie);
}

function getMovieDisplayTitle(movie, language) {
  return (
    movie?.title?.[language] ||
    movie?.title?.uz ||
    movie?.title?.ru ||
    "Untitled"
  );
}

module.exports = {
  filterMoviesByQuery,
  getMovieDisplayTitle,
  normalize,
};
