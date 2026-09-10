import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchActorById } from '../api/actorsApi';
import { useMoviesCatalog } from '../context/MoviesCatalogContext';
import { useContentLanguage } from '../context/ContentLanguageContext';
import LoaderSkeleton from '../components/LoaderSkeleton/LoaderSkeleton';
import Movies from '../components/Movies/Movies';
import ActorsInfoModal from '../components/Actors/ActorsInfoModal';
import './ActorsPage.css';

const ActorsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { contentLang } = useContentLanguage();
  const { allMovies, isLoading: catalogLoading, ensureFullCatalog } = useMoviesCatalog();
  const [actorsLoading, setActorsLoading] = useState(true);
  const [actor, setActor] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [descOverflows, setDescOverflows] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    ensureFullCatalog();
  }, [ensureFullCatalog]);

  useEffect(() => {
    let isMounted = true;

    const loadActor = async () => {
      try {
        setActorsLoading(true);
        const data = await fetchActorById(id);
        if (isMounted) setActor(data);
      } catch (_error) {
        if (isMounted) setActor(null);
      } finally {
        if (isMounted) setActorsLoading(false);
      }
    };

    loadActor();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const actorMovies = actor
    ? allMovies.filter((movie) => movie.actors?.includes(actor.actorId))
    : [];
  const isPageLoading = actorsLoading || catalogLoading;

  const actorName = actor?.name?.[contentLang] || actor?.name?.uz || actor?.name?.ru || '';
  const actorInfo = actor?.info?.[contentLang] || actor?.info?.uz || actor?.info?.ru || '';

  const measureDescOverflow = useCallback(() => {
    const el = descRef.current;
    if (!el) {
      setDescOverflows(false);
      return;
    }
    setDescOverflows(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    if (isPageLoading || !actorInfo) {
      setDescOverflows(false);
      return undefined;
    }
    measureDescOverflow();
    window.addEventListener('resize', measureDescOverflow);
    return () => window.removeEventListener('resize', measureDescOverflow);
  }, [actorInfo, isPageLoading, measureDescOverflow, contentLang]);

  if (!isPageLoading && !actor) {
    return (
      <div className="actors-page actors-page-error">
        <h2>{i18n.language === 'uz' ? 'Aktyor topilmadi' : 'Актер не найден'}</h2>
        <button onClick={() => navigate(-1)}>
          {i18n.language === 'uz' ? 'Orqaga' : 'Назад'}
        </button>
      </div>
    );
  }

  const moreLabel = i18n.language === 'uz' ? 'yana' : 'ещё';

  return (
    <div className="actors-page">
      <div className="actors-page-header">
        {isPageLoading ? (
          <LoaderSkeleton variant="actors-page-back" width={40} height={40} className="actors-page-back-skeleton" />
        ) : (
          <button
            type="button"
            className="actors-page-back"
            onClick={() => navigate(-1)}
            aria-label={i18n.language === 'uz' ? 'Orqaga' : 'Назад'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className="actors-page-profile">
          {isPageLoading ? (
            <>
              <LoaderSkeleton variant="actors-page-image" width={120} className="actors-page-image-skeleton" />
              <div className="actors-page-info actors-page-info-skeleton">
                <LoaderSkeleton variant="actors-page-name" width="80%" height={36} className="actors-page-name-skeleton" />
                <LoaderSkeleton variant="actors-page-desc" width="100%" height={60} className="actors-page-desc-skeleton" />
              </div>
            </>
          ) : (
            <>
              <div className="actors-page-image">
                <img src={actor.image} alt={actorName} />
              </div>
              <div className="actors-page-info">
                <h1 className="actors-page-name">{actorName}</h1>
                <div className="actors-page-desc-row">
                  <p ref={descRef} className="actors-page-desc">
                    {actorInfo}
                  </p>
                  {descOverflows && (
                    <button
                      type="button"
                      className="actors-page-desc-more"
                      onClick={() => setShowInfoModal(true)}
                    >
                      {moreLabel}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="actors-page-movies">
        {isPageLoading ? (
          <LoaderSkeleton variant="text" width={180} height={28} className="actors-page-movies-title-skeleton" />
        ) : (
          <h2 className="actors-page-movies-title">
            {i18n.language === 'uz' ? 'Filmlar' : 'Фильмы'} ({actorMovies.length})
          </h2>
        )}
        <Movies
          sectionType="all"
          limit={null}
          filteredMovies={actorMovies}
          hideHeader
          isLoading={isPageLoading}
        />
      </div>

      {showInfoModal && (
        <ActorsInfoModal
          title={actorName}
          text={actorInfo}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </div>
  );
};

export default ActorsPage;
