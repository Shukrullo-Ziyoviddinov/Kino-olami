import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMoviesCatalog } from '../../context/MoviesCatalogContext';
import { useLoading } from '../../context/LoadingContext';
import HorizontalScroll from '../HorizontalScroll/HorizontalScroll';
import ShowMoreButton, { getDisplayItems, shouldShowMore, DEFAULT_LIMIT } from '../ShowMoreButton/ShowMoreButton';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import MovieItem from './MovieItem';
import './Movies.css';

const Movies = ({ sectionType = 'recommended', limit = DEFAULT_LIMIT, filteredMovies = null, showHorizontalScroll = false, headerTitle = null, headerCount = null, hideHeader = false, moreTo = null, isLoading: isLoadingProp = null, sectionHasMore = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { moviesLoading } = useLoading();
  const { allMovies, recommendedMovies } = useMoviesCatalog();
  const isLoading = isLoadingProp ?? moviesLoading;

  let allMoviesData = filteredMovies || allMovies;
  if (sectionType === 'recommended' && !filteredMovies) {
    allMoviesData = recommendedMovies;
  }

  const shouldShowLimit = limit != null;
  const displayMovies = getDisplayItems(allMoviesData, shouldShowLimit ? limit : null);
  const hasMoreMovies = shouldShowMore(allMoviesData, limit, moreTo) || Boolean(sectionHasMore);
  const placeholderCount = shouldShowLimit ? Math.max(4, Math.min(limit || DEFAULT_LIMIT, 8)) : 8;
  const shouldRenderPlaceholders = isLoading && allMoviesData.length === 0;

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const isHorizontal = showHorizontalScroll;
  const isWideLayout = false;

  const renderMovieItem = (movie, index) => (
    <MovieItem
      key={`${movie.id}-${index}`}
      movie={movie}
      isDataLoading={isLoading}
      isHorizontal={isHorizontal}
      isWideLayout={isWideLayout}
      onMovieClick={handleMovieClick}
    />
  );

  return (
    <div className="movies">
      <div className="movies-container">
        {!hideHeader && (
          <div className={`movies-header ${headerCount !== null ? 'movies-header--centered' : ''}`}>
            {headerCount !== null && (
              <p className="movies-header-count">{headerCount} {t('movies.all')}</p>
            )}
            {isLoading ? (
              <LoaderSkeleton variant="text" className="movies-title-skeleton" width="180px" height="28px" />
            ) : (
              <h2 className="movies-title">{headerTitle || t(`movies.${sectionType}`)}</h2>
            )}
            {headerCount === null && (hasMoreMovies || (isLoading && moreTo)) && (
              isLoading ? (
                <LoaderSkeleton variant="button" className="more-btn-skeleton" width="90px" height="36px" />
              ) : (
                <ShowMoreButton to={moreTo || '/recommended'} />
              )
            )}
          </div>
        )}
        <div className="movies-content-wrapper">
          {isHorizontal && shouldShowLimit ? (
            <HorizontalScroll>
              {shouldRenderPlaceholders
                ? Array.from({ length: placeholderCount }).map((_, index) => (
                    <div
                      key={`movies-placeholder-${index}`}
                      className={`movies-item ${isHorizontal ? 'movies-item-horizontal' : ''} ${isWideLayout ? 'movies-item-wide' : ''}`}
                    >
                      <div className="movies-item-image-wrapper">
                        <LoaderSkeleton variant="image" />
                      </div>
                      <LoaderSkeleton variant="text" className="movies-item-title-skeleton" width="85%" height={16} />
                    </div>
                  ))
                : displayMovies.map((movie, index) => renderMovieItem(movie, index))}
            </HorizontalScroll>
          ) : (
            <div className="movies-grid">
              {shouldRenderPlaceholders
                ? Array.from({ length: placeholderCount }).map((_, index) => (
                    <div
                      key={`movies-placeholder-${index}`}
                      className={`movies-item ${isHorizontal ? 'movies-item-horizontal' : ''} ${isWideLayout ? 'movies-item-wide' : ''}`}
                    >
                      <div className="movies-item-image-wrapper">
                        <LoaderSkeleton variant="image" />
                      </div>
                      <LoaderSkeleton variant="text" className="movies-item-title-skeleton" width="85%" height={16} />
                    </div>
                  ))
                : displayMovies.map((movie, index) => renderMovieItem(movie, index))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Movies;
