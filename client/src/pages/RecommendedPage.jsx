import React, { useState, useEffect, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useMoviesCatalog } from '../context/MoviesCatalogContext';
import { fetchGenres } from '../api/genresApi';
import { fetchTopRatedMovies } from '../api/moviesApi';
import { fetchMoviesCatalog } from '../api/moviesCatalogApi';
import Filters from '../components/Filters';
import Movies from '../components/Movies/Movies';
import './RecommendedPage.css';

const CATEGORY_GENRE_MAP = {
  romantika: ['Romantika', 'Romantik'],
  multfilimlar: ['Multfilim', 'Animatsiya', 'Anime'],
  anime: ['Anime'],
  doramalar: ['Drama'],
  komediya: ['Komediya'],
  jangari: ['Jangari', 'Boevik'],
  horror: ["Qo'rqinchli", 'Horror'],
  sarguzasht: ['Sarguzasht'],
  fantastika: ['Fantastika'],
};

const CATALOG_SECTIONS = new Set([
  'koreaDrama',
  'kinolar',
  'worldMovies',
  'animations',
  'turkishSeries',
  'tvSeries',
  'actionMovies',
  'horrorMovies',
  'romanceMovies',
  'anonslar',
]);

const normalizeFilterValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[’ʻʼ`]/g, "'");

const resolvePageLimit = () => {
  if (typeof window === 'undefined') return 14;
  // Birinchi ekranda ko'rinadiganlar + biroz zaxira; qolgani scroll da
  return window.innerWidth < 768 ? 12 : 14;
};

const shouldLoadMoreByScroll = () => {
  if (typeof window === 'undefined') return false;
  const threshold = 700;
  const scrollBottom = window.innerHeight + window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  return scrollBottom >= docHeight - threshold || docHeight <= window.innerHeight + threshold;
};

const resolveSectionKey = (categoryId, pathname) => {
  if (pathname === '/recommended') return 'recommended';
  if (!categoryId || categoryId === 'topRated') return null;
  if (categoryId === 'korea') return 'koreaDrama';
  if (CATALOG_SECTIONS.has(categoryId)) return categoryId;
  return null;
};

const mergeUniqueById = (current = [], next = []) => {
  const map = new Map();
  [...current, ...next].forEach((item) => {
    if (item?.id == null) return;
    map.set(item.id, item);
  });
  return Array.from(map.values());
};

const getRatingFilter = (movie, selectedRating) => {
  if (selectedRating === null) return true;
  const val = movie.ratingImdb;
  return val != null && val !== '' && val !== 'none' && (val === selectedRating || Number(val) === Number(selectedRating));
};

const getSimilarMovies = (currentMovie, movies) => {
  if (!currentMovie) return [];
  const currentTypeCategory = Array.isArray(currentMovie.typeCategory)
    ? currentMovie.typeCategory.map((tc) => String(tc).toLowerCase().trim())
    : currentMovie.typeCategory
    ? [String(currentMovie.typeCategory).toLowerCase().trim()]
    : [];
  const currentFilterCountry = currentMovie.filterCountry
    ? String(currentMovie.filterCountry).toLowerCase().trim()
    : '';
  return movies.filter((movie) => {
    if (movie.id === currentMovie.id) return false;
    if (!movie.typeCategory && !movie.filterCountry) return false;
    const movieTypeCategory = Array.isArray(movie.typeCategory)
      ? movie.typeCategory.map((tc) => String(tc).toLowerCase().trim())
      : movie.typeCategory
      ? [String(movie.typeCategory).toLowerCase().trim()]
      : [];
    const movieFilterCountry = movie.filterCountry
      ? String(movie.filterCountry).toLowerCase().trim()
      : '';
    const hasMatchingTypeCategory =
      currentTypeCategory.length > 0 &&
      movieTypeCategory.length > 0 &&
      currentTypeCategory.some((ctc) => movieTypeCategory.includes(ctc));
    const hasMatchingFilterCountry =
      currentFilterCountry &&
      movieFilterCountry &&
      currentFilterCountry === movieFilterCountry;
    return hasMatchingTypeCategory || hasMatchingFilterCountry;
  });
};

const RecommendedPage = () => {
  const { categoryId, movieId } = useParams();
  const location = useLocation();
  const {
    allMovies,
    isLoading: catalogLoading,
    ensureFullCatalog,
  } = useMoviesCatalog();
  const [searchParams] = useSearchParams();
  const genreFromUrl = searchParams.get('genre');
  const [genresConfig, setGenresConfig] = useState([]);
  const getGenresFromUrl = useCallback((g) => {
    if (!g) return [];
    const normalized = normalizeFilterValue(g);
    const genreConfig = genresConfig.find(
      (c) =>
        Array.isArray(c.filterGenre) &&
        c.filterGenre.some((fg) => normalizeFilterValue(fg) === normalized)
    );
    if (genreConfig) {
      return [...genreConfig.filterGenre];
    }
    return [g];
  }, [genresConfig]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [topRatedLoading, setTopRatedLoading] = useState(false);
  const [topRatedLoadingMore, setTopRatedLoadingMore] = useState(false);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [topRatedHasMore, setTopRatedHasMore] = useState(true);
  const [pageLimit] = useState(resolvePageLimit);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState(() =>
    genreFromUrl
      ? getGenresFromUrl(genreFromUrl)
      : (categoryId && CATEGORY_GENRE_MAP[categoryId]) || []
  );
  const [selectedAge, setSelectedAge] = useState(null);

  // Bo'lim / recommended uchun alohida pagination (avval kerakli kinolar)
  const [sectionMovies, setSectionMovies] = useState([]);
  const [sectionPage, setSectionPage] = useState(1);
  const [sectionHasMore, setSectionHasMore] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionLoadingMore, setSectionLoadingMore] = useState(false);
  const sectionLoadingLockRef = useRef(false);

  const sectionKey = useMemo(() => {
    // Search janri: recommended bo'lim emas, to'liq katalogdan filterGenre bo'yicha
    if (genreFromUrl) return null;
    return resolveSectionKey(categoryId, location.pathname);
  }, [categoryId, location.pathname, genreFromUrl]);

  useEffect(() => {
    let isMounted = true;

    const loadGenres = async () => {
      try {
        setGenresLoading(true);
        const data = await fetchGenres();
        if (isMounted) setGenresConfig(data);
      } catch (_error) {
        if (isMounted) setGenresConfig([]);
      } finally {
        if (isMounted) setGenresLoading(false);
      }
    };

    loadGenres();
    return () => {
      isMounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (genreFromUrl) {
      setSelectedGenres(getGenresFromUrl(genreFromUrl));
    } else if (categoryId && CATEGORY_GENRE_MAP[categoryId]) {
      setSelectedGenres(CATEGORY_GENRE_MAP[categoryId]);
    } else {
      setSelectedGenres([]);
    }
  }, [genreFromUrl, categoryId, getGenresFromUrl]);

  const loadSectionPage = useCallback(async (pageToLoad, { append = false } = {}) => {
    if (!sectionKey) return;
    const data = await fetchMoviesCatalog({
      page: pageToLoad,
      limit: pageLimit,
      section: sectionKey,
    });
    const nextItems = sectionKey === 'recommended'
      ? (data.recommendedMovies || data.allMovies || [])
      : (data.allMovies || []);
    const nextMeta = data.meta || {};

    setSectionMovies((prev) => (append ? mergeUniqueById(prev, nextItems) : nextItems));
    setSectionHasMore(Boolean(nextMeta.hasNextPage));
    setSectionPage(pageToLoad);
  }, [pageLimit, sectionKey]);

  // Avval kerakli bo'lim/tavsiya kinolarini yuklash
  useEffect(() => {
    let isMounted = true;
    if (!sectionKey) {
      setSectionMovies([]);
      setSectionHasMore(false);
      setSectionPage(1);
      return undefined;
    }

    const loadInitial = async () => {
      try {
        setSectionLoading(true);
        await loadSectionPage(1, { append: false });
      } catch (_error) {
        console.error('[RecommendedPage] section yuklash xatoligi:', _error?.message || _error);
        if (isMounted) {
          setSectionMovies([]);
          setSectionHasMore(false);
        }
      } finally {
        if (isMounted) setSectionLoading(false);
      }
    };

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [sectionKey, loadSectionPage]);

  // Bo'lim/tavsiya: scroll da qolgan sahifalar
  useEffect(() => {
    if (!sectionKey) return undefined;
    if (sectionLoading || sectionLoadingMore || !sectionHasMore) return undefined;

    const onScroll = async () => {
      if (!shouldLoadMoreByScroll()) return;
      if (sectionLoadingLockRef.current) return;
      sectionLoadingLockRef.current = true;
      try {
        setSectionLoadingMore(true);
        await loadSectionPage(sectionPage + 1, { append: true });
      } catch (_error) {
        console.error('[RecommendedPage] section keyingi sahifa xatoligi:', _error?.message || _error);
        setSectionHasMore(false);
      } finally {
        setSectionLoadingMore(false);
        sectionLoadingLockRef.current = false;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionKey, sectionLoading, sectionLoadingMore, sectionHasMore, sectionPage, loadSectionPage, sectionMovies.length]);

  const loadTopRatedPage = useCallback(async (pageToLoad, { append = false } = {}) => {
    const data = await fetchTopRatedMovies({ page: pageToLoad, limit: pageLimit });
    const nextItems = data.items || [];
    const nextMeta = data.meta || {};

    setTopRatedMovies((prev) => (append ? mergeUniqueById(prev, nextItems) : nextItems));
    setTopRatedHasMore(Boolean(nextMeta.hasNextPage));
    setTopRatedPage(pageToLoad);
  }, [pageLimit]);

  useEffect(() => {
    let isMounted = true;
    if (categoryId !== 'topRated') return undefined;

    const loadInitialTopRated = async () => {
      try {
        setTopRatedLoading(true);
        await loadTopRatedPage(1, { append: false });
      } catch (_error) {
        console.error('[RecommendedPage] top-rated boshlang‘ich yuklash xatoligi:', _error?.message || _error);
        if (isMounted) {
          setTopRatedMovies([]);
          setTopRatedHasMore(false);
        }
      } finally {
        if (isMounted) {
          setTopRatedLoading(false);
        }
      }
    };

    loadInitialTopRated();
    return () => {
      isMounted = false;
    };
  }, [categoryId, loadTopRatedPage]);

  useEffect(() => {
    if (categoryId !== 'topRated') return undefined;
    if (topRatedLoading || topRatedLoadingMore || !topRatedHasMore) return undefined;

    const onScroll = async () => {
      if (!shouldLoadMoreByScroll()) return;

      try {
        setTopRatedLoadingMore(true);
        await loadTopRatedPage(topRatedPage + 1, { append: true });
      } catch (_error) {
        console.error('[RecommendedPage] top-rated keyingi sahifa xatoligi:', _error?.message || _error);
        setTopRatedHasMore(false);
      } finally {
        setTopRatedLoadingMore(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [categoryId, loadTopRatedPage, topRatedHasMore, topRatedLoading, topRatedLoadingMore, topRatedPage]);

  // Genre / similar sahifalar — kerakli to'liq katalog (lazy)
  const isSimilarMoviesPage = location.pathname.startsWith('/similar-movies/');
  const isGenreCategoryPage = Boolean(categoryId && CATEGORY_GENRE_MAP[categoryId]);
  const useCatalogScroll = !sectionKey && categoryId !== 'topRated' && (isSimilarMoviesPage || isGenreCategoryPage || Boolean(genreFromUrl));

  useEffect(() => {
    if (!useCatalogScroll) return undefined;
    ensureFullCatalog();
    return undefined;
  }, [useCatalogScroll, ensureFullCatalog]);

  const useAllMoviesForGenre = (genreFromUrl || isGenreCategoryPage) && selectedGenres.length > 0;

  const categoryFiltered = sectionKey
    ? sectionMovies
    : isSimilarMoviesPage && movieId
    ? (() => {
        const currentMovie = allMovies.find((m) => String(m.id) === String(movieId));
        return getSimilarMovies(currentMovie, allMovies);
      })()
    : useAllMoviesForGenre
    ? allMovies
    : categoryId === 'topRated'
      ? topRatedMovies
      : allMovies;

  let filteredMovies = categoryFiltered;
  if (selectedRating !== null) {
    filteredMovies = filteredMovies.filter((movie) => getRatingFilter(movie, selectedRating));
  }
  if (selectedCountry !== null) {
    const normalizedSelectedCountry = normalizeFilterValue(selectedCountry);
    filteredMovies = filteredMovies.filter(
      (movie) => normalizeFilterValue(movie.filterCountry) === normalizedSelectedCountry
    );
  }
  if (selectedGenres.length > 0) {
    const normalizedSelectedGenres = selectedGenres.map(normalizeFilterValue);
    filteredMovies = filteredMovies.filter((movie) =>
      (movie.filterGenre || []).some((g) =>
        normalizedSelectedGenres.includes(normalizeFilterValue(g))
      )
    );
  }
  if (selectedAge !== null) {
    filteredMovies = filteredMovies.filter((movie) => movie.ageRestriction === selectedAge);
  }

  const recommendedLoading =
    genresLoading ||
    (sectionKey && sectionLoading && sectionMovies.length === 0) ||
    (categoryId === 'topRated' && topRatedLoading && topRatedMovies.length === 0) ||
    (useCatalogScroll && catalogLoading && allMovies.length === 0);

  const loadingMore =
    (sectionKey && sectionLoadingMore) ||
    (categoryId === 'topRated' && topRatedLoadingMore);

  return (
    <div className="recommended-page">
      <Filters
        isLoading={recommendedLoading}
        movies={categoryFiltered}
        selectedRating={selectedRating}
        onRatingSelect={setSelectedRating}
        selectedCountry={selectedCountry}
        onCountrySelect={setSelectedCountry}
        selectedGenres={selectedGenres}
        onGenreSelect={setSelectedGenres}
        selectedAge={selectedAge}
        onAgeSelect={setSelectedAge}
      />
      <Movies
        sectionType="all"
        limit={null}
        filteredMovies={filteredMovies}
        hideHeader
        isLoading={recommendedLoading}
      />
      {loadingMore && (
        <Movies
          sectionType="all"
          limit={null}
          filteredMovies={[]}
          hideHeader
          isLoading
        />
      )}
    </div>
  );
};

export default RecommendedPage;
