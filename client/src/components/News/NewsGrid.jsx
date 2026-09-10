import React from 'react';
import NewsGridCard from './NewsGridCard';
import NewsGridCardSkeleton from './NewsGridCardSkeleton';
import './NewsGrid.css';

const SKELETON_COUNT = 4;

const NewsGrid = ({ items = [], onReadMore, loading = false }) => {
  if (loading) {
    return (
      <div className="news-grid">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <NewsGridCardSkeleton key={`news-grid-skel-${index}`} />
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="news-grid">
      {items.map((item) => (
        <NewsGridCard
          key={item.id || item.newsId}
          item={item}
          onReadMore={onReadMore}
        />
      ))}
    </div>
  );
};

export default NewsGrid;
