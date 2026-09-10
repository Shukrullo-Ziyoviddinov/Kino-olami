import React from 'react';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import './TrendingNews.css';
import './TrendingNewsCard.css';
import './TrendingNewsSkeleton.css';

const TrendingNewsCardSkeleton = () => {
  return (
    <div className="trending-news-card trending-news-card--skeleton" aria-hidden>
      <div className="trending-news-card-media">
        <div className="trending-news-skel-media">
          <LoaderSkeleton variant="block" />
        </div>
      </div>

      <div className="trending-news-card-info">
        <LoaderSkeleton
          variant="text"
          className="trending-news-skel-name"
          width="92%"
          height={16}
        />
        <LoaderSkeleton
          variant="text"
          className="trending-news-skel-description"
          width="80%"
          height={12}
        />
        <div className="trending-news-card-meta trending-news-skel-meta">
          <LoaderSkeleton variant="text" width={72} height={12} />
          <LoaderSkeleton variant="text" width={42} height={12} />
        </div>
      </div>
    </div>
  );
};

const TrendingNewsSkeleton = ({ count = 4 }) => {
  return (
    <aside className="trending-news trending-news--skeleton" aria-hidden>
      <div className="trending-news-header">
        <LoaderSkeleton
          variant="icon"
          className="trending-news-skel-icon"
          width={16}
          height={16}
        />
        <LoaderSkeleton
          variant="text"
          className="trending-news-skel-title"
          width={160}
          height={14}
        />
      </div>

      <div className="trending-news-list">
        {Array.from({ length: count }).map((_, index) => (
          <TrendingNewsCardSkeleton key={`trending-skel-${index}`} />
        ))}
      </div>
    </aside>
  );
};

export default TrendingNewsSkeleton;
export { TrendingNewsCardSkeleton };
