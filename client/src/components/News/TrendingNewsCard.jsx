import React from 'react';
import { useContentLanguage } from '../../context/ContentLanguageContext';
import { formatNewsDate, formatNewsViews } from './newsDate';
import './TrendingNewsCard.css';

const getLocalized = (value, lang) => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.uz || value.ru || '';
  }
  return String(value);
};

const TrendingNewsCard = ({ item, onClick }) => {
  const { contentLang } = useContentLanguage();
  const name = getLocalized(item?.name, contentLang);
  const description = getLocalized(item?.description, contentLang);
  const imgSrc = item?.img ? encodeURI(item.img) : '';
  const dateLabel = formatNewsDate(item);

  return (
    <button
      type="button"
      className="trending-news-card"
      onClick={() => onClick?.(item)}
      aria-label={name || 'Trend yangilik'}
    >
      <div className="trending-news-card-media">
        {imgSrc ? (
          <img className="trending-news-card-img" src={imgSrc} alt="" loading="lazy" />
        ) : (
          <span className="trending-news-card-img trending-news-card-img--empty" />
        )}
        {item?.video ? (
          <span className="trending-news-card-play" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        ) : null}
      </div>

      <div className="trending-news-card-info">
        {name ? <p className="trending-news-card-name">{name}</p> : null}
        {description ? (
          <p className="trending-news-card-description">{description}</p>
        ) : null}

        <div className="trending-news-card-meta">
          {dateLabel ? (
            <span className="trending-news-card-meta-item" title="Sana">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dateLabel}
            </span>
          ) : null}
          <span className="trending-news-card-meta-item" title="Ko'rishlar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {formatNewsViews(item?.views)}
          </span>
        </div>
      </div>
    </button>
  );
};

export default TrendingNewsCard;
