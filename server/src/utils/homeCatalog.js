const HOME_SECTION_LIMIT = 7;
const HOME_SECTIONS_PER_BATCH = 2;

/** Home bo'limlari tartibi (topRated / weeklyTop — UI slot, DB section emas) */
const HOME_SECTION_ORDER = [
  "koreaDrama",
  "weeklyTop",
  "kinolar",
  "worldMovies",
  "animations",
  "turkishSeries",
  "tvSeries",
  "topRated",
  "actionMovies",
  "horrorMovies",
  "romanceMovies",
];

const HOME_UI_ONLY_SECTIONS = new Set(["topRated", "weeklyTop"]);

const parseHomeBatchQuery = (query = {}) => {
  const batchRaw = Number(query.batch);
  const limitRaw = Number(query.limit);
  const batchSizeRaw = Number(query.batchSize);

  const batch = Number.isFinite(batchRaw) && batchRaw >= 0 ? Math.floor(batchRaw) : 0;
  const limitPerSection =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), 30)
      : HOME_SECTION_LIMIT;
  const batchSize =
    Number.isFinite(batchSizeRaw) && batchSizeRaw > 0
      ? Math.min(Math.floor(batchSizeRaw), 10)
      : HOME_SECTIONS_PER_BATCH;

  return { batch, limitPerSection, batchSize };
};

module.exports = {
  HOME_SECTION_LIMIT,
  HOME_SECTIONS_PER_BATCH,
  HOME_SECTION_ORDER,
  HOME_UI_ONLY_SECTIONS,
  parseHomeBatchQuery,
};
