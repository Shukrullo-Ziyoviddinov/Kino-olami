import React from 'react';
import { useTranslation } from 'react-i18next';
import TrendingNewsCard from './TrendingNewsCard';
import TrendingNewsSkeleton from './TrendingNewsSkeleton';
import './TrendingNews.css';

const TrendingNews = ({ items = [], onSelect, loading = false }) => {
  const { i18n } = useTranslation();

  if (loading) {
    return <TrendingNewsSkeleton count={4} />;
  }

  if (!items.length) return null;

  return (
    <aside className="trending-news">
      <div className="trending-news-header">
        <span className="trending-news-header-icon" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c.4 3.2-1.2 5.3-3 7.2-1.5 1.6-2.8 3-2.8 5.1A5.8 5.8 0 0 0 12 20a5.8 5.8 0 0 0 5.8-5.7c0-2.5-1.2-4-2.9-5.8C13.3 6.7 11.7 4.8 12 2z" />
          </svg>
        </span>
        <h3 className="trending-news-title">
          {i18n.language === 'ru' ? 'Трендовые новости' : 'Trenddagi yangiliklar'}
        </h3>
      </div>

      <div className="trending-news-list">
        {items.map((item) => (
          <TrendingNewsCard
            key={item.id || item.newsId}
            item={item}
            onClick={onSelect}
          />
        ))}
      </div>
    </aside>
  );
};

export default TrendingNews;
