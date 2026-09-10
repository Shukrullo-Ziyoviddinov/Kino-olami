import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import HorizontalScroll from '../HorizontalScroll/HorizontalScroll';
import ShowMoreButton from '../ShowMoreButton/ShowMoreButton';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import { useMoviesCatalog, HOME_SECTION_LIMIT } from '../../context/MoviesCatalogContext';
import { useContentLanguage } from '../../context/ContentLanguageContext';
import { getMovieAgeRestriction } from '../../utils/utils';
import './SearchModalAnons.css';

const PLACEHOLDER_COUNT = 6;

const SearchModalAnons = ({ onAnonsClick }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { contentLang } = useContentLanguage();
  const { sections, allMovies, anonsLoading, ensureAnonslar } = useMoviesCatalog();

  useEffect(() => {
    ensureAnonslar();
  }, [ensureAnonslar]);

  const anonslar = useMemo(() => {
    const map = new Map();
    const push = (item) => {
      if (item?.id == null) return;
      map.set(item.id, item);
    };
    (sections?.anonslar || []).forEach(push);
    (allMovies || []).forEach((movie) => {
      if (movie?.category === 'anonslar' || movie?.categoryName === 'anons') {
        push(movie);
      }
    });
    return Array.from(map.values()).slice(0, HOME_SECTION_LIMIT);
  }, [sections, allMovies]);

  const getTitle = (item) => {
    if (item.title && typeof item.title === 'object') {
      return item.title[contentLang] || item.title.uz || item.title.ru;
    }
    return item.title || '';
  };

  const getImg = (item) => {
    if (item.homeImg && typeof item.homeImg === 'object') {
      return item.homeImg[contentLang] || item.homeImg.uz || item.homeImg.ru;
    }
    return item.homeImg || item.img || '';
  };

  const handleClick = (item) => {
    if (onAnonsClick) onAnonsClick();
    navigate(`/movie/${item.id}`);
  };

  const handleMoreClick = () => {
    if (onAnonsClick) onAnonsClick();
    navigate('/category/anonslar');
  };

  const isLoading = anonsLoading && anonslar.length === 0;

  if (!isLoading && anonslar.length === 0) return null;

  return (
    <div className="search-modal-anons">
      <div className="search-modal-anons-header">
        {isLoading ? (
          <>
            <LoaderSkeleton
              variant="text"
              className="search-modal-anons-title-skeleton"
              width={120}
              height={22}
            />
            <LoaderSkeleton
              variant="button"
              className="search-modal-anons-more-skeleton"
              width={72}
              height={28}
            />
          </>
        ) : (
          <>
            <h3 className="search-modal-anons-title">
              {i18n.language === 'ru' ? 'Скоро' : 'Tez kunda'}
            </h3>
            <ShowMoreButton to="/category/anonslar" onClick={handleMoreClick} className="search-modal-anons-more-btn" />
          </>
        )}
      </div>
      <HorizontalScroll scrollAmount={120}>
        {isLoading
          ? Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
              <div key={`anons-skeleton-${index}`} className="search-modal-anons-item">
                <div className="search-modal-anons-item-image-wrapper search-modal-anons-item-skeleton">
                  <LoaderSkeleton variant="image" />
                </div>
              </div>
            ))
          : anonslar.map((item) => (
              <div
                key={item.id}
                className="search-modal-anons-item"
                onClick={() => handleClick(item)}
              >
                <div className="search-modal-anons-item-image-wrapper">
                  <img
                    src={getImg(item)}
                    alt={getTitle(item)}
                    className="search-modal-anons-item-image"
                  />
                  <span className="search-modal-anons-badge search-modal-anons-badge-soon">
                    {t('searchModal.tezOrada', 'Tez orada')}
                  </span>
                  {getMovieAgeRestriction(item) != null && (
                    <span className="search-modal-anons-badge search-modal-anons-badge-age">
                      {getMovieAgeRestriction(item)}+
                    </span>
                  )}
                </div>
              </div>
            ))}
      </HorizontalScroll>
    </div>
  );
};

export default SearchModalAnons;
