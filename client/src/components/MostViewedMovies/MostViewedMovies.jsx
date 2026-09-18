import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchMostViewedMovies, MOST_VIEWED_LIMIT } from '../../api/moviesApi';
import HorizontalScroll from '../HorizontalScroll/HorizontalScroll';
import ShowMoreButton, { getDisplayItems, shouldShowMore, DEFAULT_LIMIT } from '../ShowMoreButton/ShowMoreButton';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import MovieItem from '../Movies/MovieItem';
import './MostViewedMovies.css';

/**
 * Eng ko'p ko'rilgan.
 * - variant="detail" — movie detail (o'xshashlardan keyin), HorizontalScroll
 * - variant="page" — /category/mostViewed grid
 */
const MostViewedMovies = ({
  variant = 'detail',
  limit = DEFAULT_LIMIT,
  moreTo = '/category/mostViewed',
  excludeMovieId = null,
  hideHeader = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [movies, setMovies] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const isDetail = variant === 'detail';
  const isPage = variant === 'page';
  const fetchLimit = MOST_VIEWED_LIMIT;

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMostViewedMovies({ limit: fetchLimit });
        if (isMounted) {
          setMovies(data.items || []);
        }
      } catch (error) {
        console.error('[MostViewedMovies] yuklashda xatolik:', error?.message || error);
        if (isMounted) setMovies([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [fetchLimit]);

  const filteredMovies = React.useMemo(() => {
    if (excludeMovieId == null) return movies;
    return movies.filter((m) => String(m.id) !== String(excludeMovieId));
  }, [movies, excludeMovieId]);

  if (!isLoading && filteredMovies.length === 0) {
    return null;
  }

  const displayLimit = isPage ? null : limit;
  const displayMovies = getDisplayItems(filteredMovies, displayLimit);
  const hasMore = Boolean(moreTo) && shouldShowMore(filteredMovies, displayLimit, moreTo);
  const placeholderCount = isPage ? 8 : Math.max(4, Math.min(limit || DEFAULT_LIMIT, 7));

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const renderCard = (movie, index, isPlaceholder = false) => {
    if (isPlaceholder) {
      return (
        <div
          key={`most-viewed-ph-${index}`}
          className={`most-viewed-item ${isPage ? 'most-viewed-item--grid' : ''}`}
        >
          <div className={`movies-item ${isDetail ? 'movies-item-horizontal' : ''} most-viewed-card`}>
            <div className="movies-item-image-wrapper">
              <LoaderSkeleton variant="image" />
            </div>
            <LoaderSkeleton variant="text" className="movies-item-title-skeleton" width="85%" height={16} />
          </div>
        </div>
      );
    }

    return (
      <div
        key={movie.id}
        className={`most-viewed-item ${isPage ? 'most-viewed-item--grid' : ''}`}
      >
        <MovieItem
          movie={movie}
          isDataLoading={isLoading}
          isHorizontal={isDetail}
          className="most-viewed-card"
          onMovieClick={handleMovieClick}
        />
      </div>
    );
  };

  const listContent =
    isLoading && filteredMovies.length === 0
      ? Array.from({ length: placeholderCount }).map((_, index) => renderCard(null, index, true))
      : displayMovies.map((movie, index) => renderCard(movie, index));

  if (isDetail) {
    return (
      <div className="most-viewed most-viewed--detail">
        {!hideHeader && (
          <div className="most-viewed-header">
            {isLoading ? (
              <LoaderSkeleton variant="text" className="most-viewed-title-skeleton" width="220px" height="28px" />
            ) : (
              <h3 className="most-viewed-title">{t('movies.mostViewed')}</h3>
            )}
            {(hasMore || (isLoading && moreTo)) && moreTo && (
              isLoading ? (
                <LoaderSkeleton variant="button" className="more-btn-skeleton" width="90px" height="36px" />
              ) : (
                <ShowMoreButton to={moreTo} />
              )
            )}
          </div>
        )}
        <HorizontalScroll scrollAmount={300}>
          {listContent}
        </HorizontalScroll>
      </div>
    );
  }

  return (
    <div className="movies most-viewed most-viewed--page">
      <div className="movies-container">
        {!hideHeader && (
          <div className="movies-header">
            {isLoading ? (
              <LoaderSkeleton variant="text" className="movies-title-skeleton" width="240px" height="28px" />
            ) : (
              <h2 className="movies-title">{t('movies.mostViewed')}</h2>
            )}
          </div>
        )}
        <div className="movies-content-wrapper">
          <div className="movies-grid most-viewed-grid">{listContent}</div>
        </div>
      </div>
    </div>
  );
};

export default MostViewedMovies;
