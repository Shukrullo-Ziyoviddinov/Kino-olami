import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchSimilarMovies } from '../../api/moviesApi';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import HorizontalScroll from '../HorizontalScroll/HorizontalScroll';
import ShowMoreButton, { getDisplayItems, DEFAULT_LIMIT } from '../ShowMoreButton/ShowMoreButton';
import SimilarMovieItem from './SimilarMovieItem';
import './SimilarMovies.css';

const SimilarMovies = ({ currentMovie }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentMovieId = currentMovie?.id;

  useEffect(() => {
    let isMounted = true;
    const loadSimilar = async () => {
      if (!currentMovieId) {
        if (isMounted) {
          setSimilarMovies([]);
          setIsLoading(false);
        }
        return;
      }
      try {
        setIsLoading(true);
        const result = await fetchSimilarMovies(currentMovieId, { page: 1, limit: 30 });
        if (isMounted) {
          setSimilarMovies(result.items || []);
        }
      } catch (_error) {
        if (isMounted) {
          setSimilarMovies([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadSimilar();
    return () => {
      isMounted = false;
    };
  }, [currentMovieId]);

  if (!currentMovie) return null;

  if (isLoading) {
    return (
      <div className="similar-movies similar-movies-skeleton">
        <LoaderSkeleton variant="similar-movies-title" className="similar-movies-title-skeleton" width={200} height={28} />
        <div className="similar-movies-skeleton-row">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`similar-skel-${index}`} className="similar-movies-item similar-movies-item-skeleton-card">
              <div className="similar-movies-item-image-wrapper">
                <LoaderSkeleton variant="similar-movies-item-image" className="similar-movies-item-skeleton" />
              </div>
              <LoaderSkeleton
                variant="text"
                className="similar-movies-item-title-skeleton"
                width="85%"
                height={16}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (similarMovies.length === 0) {
    return null;
  }

  const moreToPath = `/similar-movies/${currentMovie.id}`;
  const displayMovies = getDisplayItems(similarMovies, DEFAULT_LIMIT);

  return (
    <div className="similar-movies">
      <div className="similar-movies-header">
        <h3 className="similar-movies-title">
          {i18n.language === 'uz' ? "O'xshash filimlar" : 'Похожие фильмы'}
        </h3>
        <ShowMoreButton to={moreToPath} />
      </div>
      <HorizontalScroll scrollAmount={300}>
        {displayMovies.map((movie) => (
          <SimilarMovieItem
            key={movie.id}
            movie={movie}
            onMovieClick={handleMovieClick}
          />
        ))}
      </HorizontalScroll>
    </div>
  );
};

export default SimilarMovies;
