import React from 'react';
import { useTranslation } from 'react-i18next';
import { fetchTopRatedMovies } from '../../api/moviesApi';
import Movies from '../Movies/Movies';
import { DEFAULT_LIMIT } from '../ShowMoreButton/ShowMoreButton';

const TopRatedContent = ({ limit = DEFAULT_LIMIT, showHorizontalScroll = true, moreTo = '/category/topRated' }) => {
  const { t } = useTranslation();
  const [topRatedMovies, setTopRatedMovies] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadTopRated = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTopRatedMovies({ page: 1, limit });
        if (isMounted) {
          setTopRatedMovies(data.items || []);
        }
      } catch (_error) {
        console.error('[TopRatedContent] top-rated yuklashda xatolik:', _error?.message || _error);
        if (isMounted) {
          setTopRatedMovies([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTopRated();
    return () => {
      isMounted = false;
    };
  }, [limit]);

  return (
    <Movies
      sectionType="topRated"
      filteredMovies={topRatedMovies}
      limit={limit}
      showHorizontalScroll={showHorizontalScroll}
      headerTitle={t('movies.topRated')}
      moreTo={moreTo}
      isLoading={isLoading}
    />
  );
};

export default TopRatedContent;
