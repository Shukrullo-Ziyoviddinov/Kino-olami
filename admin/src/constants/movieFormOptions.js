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
  "animation",
];

/**
 * categoryName → catalog section (home/API).
 * animation = Multfilmlar olami
 * animations = Tarixiy doramalar (boshqa bo'lim)
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
  animationMovie: "animations",
  multFilm: "animations",
  animation: "animation",
};

/** Admin dropdown — category va categoryName bir xil ro'yxat */
export const CATEGORY_NAME_OPTIONS = [
  "Dorama",
  "kinolar",
  "Detektiv",
  "tarixiyDoramalar",
  "animation",
  "Komediya",
  "tvSeries",
  "actionMovie",
  "horrorMovie",
  "romanceMovie",
  "anons",
];

/** Dropdownda ko'rinadigan nom */
export const CATEGORY_NAME_LABELS = {
  animation: "Multfilimlar",
};

export const getCategoryNameLabel = (value) =>
  CATEGORY_NAME_LABELS[value] || value;

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
