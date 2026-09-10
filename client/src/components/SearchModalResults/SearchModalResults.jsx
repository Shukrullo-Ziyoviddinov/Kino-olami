import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useContentLanguage } from '../../context/ContentLanguageContext';
import { useMoviesCatalog } from '../../context/MoviesCatalogContext';
import { searchMoviesByQuery } from '../../utils/searchMovies';
import { getMovieAgeRestriction } from '../../utils/utils';
import './SearchModalResults.css';

const SearchModalResults = ({ query, onMovieClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { contentLang } = useContentLanguage();
  const { allMovies, ensureFullCatalog } = useMoviesCatalog();

  useEffect(() => {
    ensureFullCatalog();
  }, [ensureFullCatalog]);

  const results = searchMoviesByQuery(allMovies, query, contentLang, 20);

  const getTitle = (m) => {
    if (m?.title && typeof m.title === 'object') {
      return m.title[contentLang] || m.title.uz || m.title.ru;
    }
    return m?.title || '';
  };

  const getImg = (m) => {
    if (m?.homeImg && typeof m.homeImg === 'object') {
      return m.homeImg[contentLang] || m.homeImg.uz || m.homeImg.ru;
    }
    return m?.homeImg || '';
  };

  const handleClick = (movie) => {
    if (onMovieClick) onMovieClick();
    navigate(`/movie/${movie.id}`);
  };

  if (!query?.trim()) return null;

  return (
    <div className="search-modal-results">
      <div className="search-modal-results-grid">
        {results.map((movie) => (
          <div
            key={movie.id}
            className="search-modal-results-item"
            onClick={() => handleClick(movie)}
          >
            <div className="search-modal-results-item-image-wrapper">
              <img
                src={getImg(movie)}
                alt={getTitle(movie)}
                className="search-modal-results-item-image"
              />
              {movie.category === 'anonslar' && (
                <span className="search-modal-results-badge search-modal-results-badge-soon">
                  {t('searchModal.tezOrada', 'Tez orada')}
                </span>
              )}
              {getMovieAgeRestriction(movie) != null && (
                <span className="search-modal-results-badge search-modal-results-badge-age">
                  {getMovieAgeRestriction(movie)}+
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {results.length === 0 && (
        <p className="search-modal-results-empty">{t('searchModal.noResults', 'Natija topilmadi')}</p>
      )}
    </div>
  );
};

export default SearchModalResults;
