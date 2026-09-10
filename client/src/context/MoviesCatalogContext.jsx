import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchHomeCatalogBatch, fetchMoviesCatalog } from '../api/moviesCatalogApi';

/** Server defaultlari bilan mos (UI uchun) */
export const HOME_SECTION_LIMIT = 7;
export const HOME_SECTIONS_PER_BATCH = 2;

export const HOME_SECTION_ORDER = [
  'koreaDrama',
  'weeklyTop',
  'kinolar',
  'worldMovies',
  'animations',
  'turkishSeries',
  'tvSeries',
  'topRated',
  'actionMovies',
  'horrorMovies',
  'romanceMovies',
];

const EMPTY_CATALOG = {
  allMovies: [],
  recommendedMovies: [],
  sections: {},
};

const MoviesCatalogContext = createContext({
  ...EMPTY_CATALOG,
  isLoading: true,
  isLoadingMore: false,
  anonsLoading: true,
  hasMore: false,
  homeVisibleCount: 0,
  homeHasMoreSections: false,
  sectionHasMore: {},
  sectionOrder: HOME_SECTION_ORDER,
  loadMore: async () => {},
  loadMoreHomeSections: async () => {},
  ensureFullCatalog: async () => {},
  ensureAnonslar: async () => {},
  error: null,
});

const mergeUniqueById = (current = [], next = []) => {
  const map = new Map();
  [...current, ...next].forEach((item) => {
    const id = item?.id;
    if (typeof id !== 'undefined') {
      map.set(id, item);
    }
  });
  return Array.from(map.values());
};

const mergeSections = (current = {}, next = {}) => {
  const keys = new Set([...Object.keys(current || {}), ...Object.keys(next || {})]);
  const merged = {};
  keys.forEach((key) => {
    merged[key] = mergeUniqueById(current?.[key] || [], next?.[key] || []);
  });
  return merged;
};

const shouldLoadMoreByScroll = () => {
  if (typeof window === 'undefined') return false;
  const threshold = 700;
  const scrollBottom = window.innerHeight + window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  return scrollBottom >= docHeight - threshold || docHeight <= window.innerHeight + threshold;
};

export const MoviesCatalogProvider = ({ children }) => {
  const [catalog, setCatalog] = useState(EMPTY_CATALOG);
  const [sectionHasMore, setSectionHasMore] = useState({});
  const [sectionOrder, setSectionOrder] = useState(HOME_SECTION_ORDER);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [anonsLoading, setAnonsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeVisibleCount, setHomeVisibleCount] = useState(0);
  const [nextBatch, setNextBatch] = useState(0);
  const [hasNextBatch, setHasNextBatch] = useState(true);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [fullCatalogLoaded, setFullCatalogLoaded] = useState(false);
  const [anonsLoaded, setAnonsLoaded] = useState(false);

  const loadingLockRef = useRef(false);
  const nextBatchRef = useRef(0);
  const hasNextBatchRef = useRef(true);
  const anonsLockRef = useRef(false);

  const applyHomeBatch = useCallback((payload) => {
    const meta = payload.meta || {};
    setCatalog((prev) => ({
      allMovies: mergeUniqueById(prev.allMovies, payload.allMovies || []),
      recommendedMovies: mergeUniqueById(prev.recommendedMovies, payload.recommendedMovies || []),
      sections: mergeSections(prev.sections, payload.sections || {}),
    }));
    setSectionHasMore((prev) => ({ ...prev, ...(payload.sectionHasMore || {}) }));
    if (payload.sectionOrder?.length) {
      setSectionOrder(payload.sectionOrder);
    }
    if (typeof meta.visibleCount === 'number') {
      setHomeVisibleCount(meta.visibleCount);
    }
    const following = Boolean(meta.hasNextBatch);
    const followingBatch = typeof meta.nextBatch === 'number' ? meta.nextBatch : null;
    hasNextBatchRef.current = following;
    nextBatchRef.current = followingBatch ?? nextBatchRef.current;
    setHasNextBatch(following);
    setNextBatch(followingBatch);
  }, []);

  const loadHomeBatch = useCallback(async (batch) => {
    const payload = await fetchHomeCatalogBatch({
      batch,
      limit: HOME_SECTION_LIMIT,
      batchSize: HOME_SECTIONS_PER_BATCH,
    });
    applyHomeBatch(payload);
    return payload;
  }, [applyHomeBatch]);

  /** Tez kunda — home batchdan mustaqil (search/home bir xil manba) */
  const ensureAnonslar = useCallback(async ({ force = false } = {}) => {
    if (!force && anonsLoaded && !anonsLockRef.current) {
      return;
    }
    if (anonsLockRef.current) return;
    anonsLockRef.current = true;
    setAnonsLoading(true);
    try {
      const data = await fetchMoviesCatalog({
        page: 1,
        limit: HOME_SECTION_LIMIT,
        section: 'anonslar',
      });
      const items = data.sections?.anonslar?.length
        ? data.sections.anonslar
        : data.allMovies || [];
      setCatalog((prev) => ({
        allMovies: mergeUniqueById(prev.allMovies, items),
        recommendedMovies: prev.recommendedMovies,
        sections: mergeSections(prev.sections, { anonslar: items }),
      }));
      setSectionHasMore((prev) => ({
        ...prev,
        anonslar: Boolean(data.meta?.hasNextPage ?? data.meta?.hasMore),
      }));
      setAnonsLoaded(true);
    } catch (err) {
      console.error("[MoviesCatalog] anonslar yuklash xatoligi:", err?.message || err);
    } finally {
      setAnonsLoading(false);
      anonsLockRef.current = false;
    }
  }, [anonsLoaded]);

  const loadMoreHomeSections = useCallback(async () => {
    if (loadingLockRef.current) return;
    if (!hasNextBatchRef.current) return;
    const batchToLoad = nextBatchRef.current;
    if (batchToLoad == null) return;

    loadingLockRef.current = true;
    try {
      setIsLoadingMore(true);
      // Skeleton birinchi chizilsin, keyin so'rov
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      await loadHomeBatch(batchToLoad);
      setError(null);
    } catch (err) {
      console.error("[MoviesCatalog] home batch xatoligi:", err?.message || err);
      setError(err);
    } finally {
      setIsLoadingMore(false);
      loadingLockRef.current = false;
    }
  }, [loadHomeBatch]);

  const ensureFullCatalog = useCallback(async () => {
    if (fullCatalogLoaded) return;
    try {
      const data = await fetchMoviesCatalog({ page: 1, limit: 100 });
      setCatalog((prev) => ({
        allMovies: mergeUniqueById(prev.allMovies, data.allMovies || []),
        recommendedMovies: mergeUniqueById(prev.recommendedMovies, data.recommendedMovies || []),
        sections: mergeSections(prev.sections, data.sections || {}),
      }));
      setFullCatalogLoaded(true);
    } catch (err) {
      console.error("[MoviesCatalog] to'liq katalog yuklash xatoligi:", err?.message || err);
    }
  }, [fullCatalogLoaded]);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      try {
        setIsLoading(true);
        setAnonsLoading(true);
        // Home batch + Tez kunda parallel — anons home'da bo'sh qolmasin
        const results = await Promise.allSettled([
          loadHomeBatch(0),
          ensureAnonslar({ force: true }),
        ]);
        if (!isMounted) return;
        const homeResult = results[0];
        if (homeResult.status === 'rejected') {
          console.error(
            "[MoviesCatalog] home boshlang'ich xatoligi:",
            homeResult.reason?.message || homeResult.reason
          );
          setError(homeResult.reason);
          hasNextBatchRef.current = false;
          setHasNextBatch(false);
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("[MoviesCatalog] home boshlang'ich xatoligi:", err?.message || err);
        if (isMounted) {
          setError(err);
          hasNextBatchRef.current = false;
          setHasNextBatch(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setAnonsLoading(false);
          setIsBootstrapped(true);
        }
      }
    };
    bootstrap();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isBootstrapped) return undefined;
    const onScroll = () => {
      if (shouldLoadMoreByScroll()) {
        loadMoreHomeSections();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isBootstrapped, loadMoreHomeSections]);

  useEffect(() => {
    if (!isBootstrapped || isLoading || isLoadingMore) return undefined;
    if (!hasNextBatch) return undefined;
    if (!shouldLoadMoreByScroll()) return undefined;
    const timer = window.setTimeout(() => {
      loadMoreHomeSections();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [catalog, hasNextBatch, isBootstrapped, isLoading, isLoadingMore, loadMoreHomeSections]);

  const value = useMemo(
    () => ({
      ...catalog,
      isLoading,
      isLoadingMore,
      anonsLoading,
      hasMore: hasNextBatch,
      homeVisibleCount,
      homeHasMoreSections: hasNextBatch,
      sectionHasMore,
      sectionOrder,
      loadMore: loadMoreHomeSections,
      loadMoreHomeSections,
      ensureFullCatalog,
      ensureAnonslar,
      error,
      nextBatch,
    }),
    [
      anonsLoading,
      catalog,
      ensureAnonslar,
      error,
      ensureFullCatalog,
      hasNextBatch,
      homeVisibleCount,
      isLoading,
      isLoadingMore,
      loadMoreHomeSections,
      nextBatch,
      sectionHasMore,
      sectionOrder,
    ]
  );

  return <MoviesCatalogContext.Provider value={value}>{children}</MoviesCatalogContext.Provider>;
};

export const useMoviesCatalog = () => useContext(MoviesCatalogContext);
