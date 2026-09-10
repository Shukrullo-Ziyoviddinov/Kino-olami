const CATEGORY_NAME_TO_SECTION = {
  romanceMovie: "romanceMovies",
  romanceMovies: "romanceMovies",
  Komediya: "turkishSeries",
  turkishMovie: "turkishSeries",
  turkishSeries: "turkishSeries",
  Detektiv: "worldMovies",
  worldMovie: "worldMovies",
  worldMovies: "worldMovies",
  tvSeries: "tvSeries",
  horrorMovie: "horrorMovies",
  horrorMovies: "horrorMovies",
  Dorama: "koreaDrama",
  koreaDrama: "koreaDrama",
  kinolar: "kinolar",
  anons: "anonslar",
  anonslar: "anonslar",
  actionMovie: "actionMovies",
  actionMovies: "actionMovies",
  tarixiyDoramalar: "animations",
  animation: "animations",
  animationMovie: "animations",
  multFilm: "animations",
  animations: "animations",
};

const SECTION_TO_CATEGORY_NAMES = Object.entries(CATEGORY_NAME_TO_SECTION).reduce((acc, [categoryName, section]) => {
  if (!acc[section]) acc[section] = [];
  acc[section].push(categoryName);
  return acc;
}, {});

const { buildPersonalizedRecommendations } = require("../services/recommendationService");

const resolveSectionKey = (movie) => {
  if (movie?.categoryName && CATEGORY_NAME_TO_SECTION[movie.categoryName]) {
    return CATEGORY_NAME_TO_SECTION[movie.categoryName];
  }
  // Fallback: to'g'ridan-to'g'ri category (section) saqlangan bo'lsa
  if (movie?.category && CATEGORY_NAME_TO_SECTION[movie.category]) {
    return CATEGORY_NAME_TO_SECTION[movie.category];
  }
  return null;
};

const transformMovies = (movies) =>
  movies
    .map((movie) => {
      const sectionKey = resolveSectionKey(movie);
      if (!sectionKey) return null;

      const nextTypeCategory = Array.isArray(movie.typeCategory)
        ? [...movie.typeCategory]
        : movie.typeCategory
        ? [movie.typeCategory]
        : [];

      if (!nextTypeCategory.includes(sectionKey)) {
        nextTypeCategory.push(sectionKey);
      }
      if (sectionKey === "koreaDrama" && !nextTypeCategory.includes("korea")) {
        nextTypeCategory.push("korea");
      }

      return {
        ...movie,
        category: sectionKey,
        typeCategory: nextTypeCategory,
      };
    })
    .filter(Boolean);

const buildMoviesCatalog = (movies, { user = null } = {}) => {
  const allMovies = transformMovies(movies);
  const recommendedMovies = buildPersonalizedRecommendations({
    movies: allMovies,
    user,
  });

  const bySection = (sectionKey) =>
    allMovies.filter((movie) => movie.category === sectionKey);

  return {
    allMovies,
    recommendedMovies,
    sections: {
      koreaDrama: bySection("koreaDrama"),
      kinolar: bySection("kinolar"),
      worldMovies: bySection("worldMovies"),
      animations: bySection("animations"),
      turkishSeries: bySection("turkishSeries"),
      tvSeries: bySection("tvSeries"),
      actionMovies: bySection("actionMovies"),
      horrorMovies: bySection("horrorMovies"),
      romanceMovies: bySection("romanceMovies"),
      anonslar: bySection("anonslar"),
    },
  };
};

module.exports = {
  CATEGORY_NAME_TO_SECTION,
  SECTION_TO_CATEGORY_NAMES,
  buildMoviesCatalog,
  transformMovies,
};
