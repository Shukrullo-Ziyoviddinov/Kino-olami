export const TYPE_CATEGORY_OPTIONS = [
  "action",
  "drama",
  "thriller",
  "comedy",
  "hindi",
  "bollywood",
  "Romantika",
  "Jangare",
  "Komediya",
  "Sarguzasht",
  "Qo'rqinchli",
  "korea",
  "usa xitoy",
];

/**
 * categoryName → catalog section (home/API).
 * category maydoni endi categoryName bilan bir xil saqlanadi.
 */
export const CATEGORY_NAME_TO_SECTION = {
  romanceMovie: "romanceMovies",
  Komediya: "turkishSeries",
  turkishMovie: "turkishSeries",
  Detektiv: "worldMovies",
  worldMovie: "worldMovies",
  tvSeries: "tvSeries",
  horrorMovie: "horrorMovies",
  Dorama: "koreaDrama",
  koreaDrama: "koreaDrama",
  kinolar: "kinolar",
  anons: "anonslar",
  actionMovie: "actionMovies",
  tarixiyDoramalar: "animations",
  animation: "animations",
  animationMovie: "animations",
  multFilm: "animations",
};

/** Admin dropdown — category va categoryName bir xil ro'yxat */
export const CATEGORY_NAME_OPTIONS = [
  "Dorama",
  "kinolar",
  "Detektiv",
  "tarixiyDoramalar",
  "Komediya",
  "tvSeries",
  "actionMovie",
  "horrorMovie",
  "romanceMovie",
  "anons",
];

export const CATEGORY_OPTIONS = CATEGORY_NAME_OPTIONS;

/** Section → asosiy categoryName (saqlash / sync) */
export const SECTION_TO_CATEGORY_NAME = Object.entries(CATEGORY_NAME_TO_SECTION).reduce(
  (acc, [categoryName, section]) => {
    if (!acc[section]) acc[section] = categoryName;
    return acc;
  },
  {}
);

export const isAnonsCategory = (categoryName, category) =>
  categoryName === "anons" ||
  category === "anons" ||
  category === "anonslar";
