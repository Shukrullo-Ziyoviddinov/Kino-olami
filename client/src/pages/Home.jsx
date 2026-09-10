import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoading } from '../context/LoadingContext';
import Banner from '../components/Banner/Banner';
import Movies from '../components/Movies/Movies';
import Triller from '../components/Triller';
import {
  useMoviesCatalog,
  HOME_SECTION_LIMIT,
} from '../context/MoviesCatalogContext';
import TopRatedContent from '../components/TopRatedContent/TopRatedContent';
import WeeklyTopMovies from '../components/WeeklyTopMovies/WeeklyTopMovies';
import './Home.css';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { setLoading } = useLoading();
  const {
    sections,
    recommendedMovies,
    isLoading: catalogLoading,
    anonsLoading,
    isLoadingMore,
    homeVisibleCount,
    homeHasMoreSections,
    sectionHasMore,
    sectionOrder,
  } = useMoviesCatalog();

  useEffect(() => {
    setLoading('movies', catalogLoading || anonsLoading);
    return () => setLoading('movies', false);
  }, [catalogLoading, anonsLoading, setLoading]);

  const sectionMeta = useMemo(() => ({
    koreaDrama: { title: t('movies.koreaDrama'), to: '/category/korea' },
    kinolar: { title: t('movies.kinolar'), to: '/category/kinolar' },
    worldMovies: { title: t('movies.worldMovies'), to: '/category/worldMovies' },
    animations: { title: t('movies.animations'), to: '/category/animations' },
    turkishSeries: { title: t('movies.turkishSeries'), to: '/category/turkishSeries' },
    tvSeries: { title: t('movies.tvSeries'), to: '/category/tvSeries' },
    actionMovies: { title: t('movies.actionMovies'), to: '/category/actionMovies' },
    horrorMovies: { title: t('movies.horrorMovies'), to: '/category/horrorMovies' },
    romanceMovies: { title: t('movies.romanceMovies'), to: '/category/romanceMovies' },
  }), [t]);

  const order = sectionOrder?.length ? sectionOrder : [];
  const visibleSectionKeys = order.slice(0, homeVisibleCount);

  const renderedSections = visibleSectionKeys.map((sectionType) => {
    if (sectionType === 'topRated') {
      return (
        <TopRatedContent
          key="top-rated-content"
          limit={HOME_SECTION_LIMIT}
          showHorizontalScroll={true}
          moreTo="/category/topRated"
        />
      );
    }

    if (sectionType === 'weeklyTop') {
      return <WeeklyTopMovies key="weekly-top-content" />;
    }

    const meta = sectionMeta[sectionType];
    const data = sections?.[sectionType] || [];
    const waitingForData = isLoadingMore && data.length === 0 && homeHasMoreSections;

    // Bo'sh bo'lim (haqiqatan 0 kino) — ko'rsatilmaydi
    if (!catalogLoading && !waitingForData && data.length === 0) {
      return null;
    }

    return (
      <Movies
        key={sectionType}
        sectionType={sectionType}
        filteredMovies={data}
        limit={HOME_SECTION_LIMIT}
        showHorizontalScroll={true}
        headerTitle={meta?.title}
        moreTo={meta?.to}
        isLoading={(catalogLoading && data.length === 0) || waitingForData}
        sectionHasMore={Boolean(sectionHasMore?.[sectionType])}
      />
    );
  });

  const anonsMovies = sections?.anonslar || [];
  const anonsSectionLoading = (catalogLoading || anonsLoading) && anonsMovies.length === 0;

  return (
    <div className="home">
      <Banner />
      <Triller />
      {(anonsSectionLoading || anonsMovies.length > 0) && (
        <Movies
          sectionType="anonslar"
          filteredMovies={anonsMovies}
          limit={HOME_SECTION_LIMIT}
          showHorizontalScroll={true}
          headerTitle={i18n.language === 'ru' ? 'Скоро' : 'Tez kunda'}
          moreTo="/category/anonslar"
          isLoading={anonsSectionLoading}
          sectionHasMore={Boolean(sectionHasMore?.anonslar)}
        />
      )}
      <Movies
        sectionType="recommended"
        filteredMovies={recommendedMovies}
        limit={HOME_SECTION_LIMIT}
        showHorizontalScroll={true}
        moreTo="/recommended"
        isLoading={catalogLoading && recommendedMovies.length === 0}
        sectionHasMore={Boolean(sectionHasMore?.recommended)}
      />
      {renderedSections}
      {isLoadingMore && (
        <>
          <Movies
            key="home-section-loader-1"
            sectionType="koreaDrama"
            filteredMovies={[]}
            limit={HOME_SECTION_LIMIT}
            showHorizontalScroll
            isLoading
          />
          <Movies
            key="home-section-loader-2"
            sectionType="kinolar"
            filteredMovies={[]}
            limit={HOME_SECTION_LIMIT}
            showHorizontalScroll
            isLoading
          />
        </>
      )}
    </div>
  );
};

export default Home;
