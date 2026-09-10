import React from 'react';
import { useContentLanguage } from '../../context/ContentLanguageContext';
import { formatNewsDate, formatNewsViews } from './newsDate';
import './NewsCard.css';

const getLocalized = (value, lang) => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.uz || value.ru || '';
  }
  return String(value);
};

const NewsCard = ({ item, onReadMore }) => {
  const { contentLang } = useContentLanguage();
  const name = getLocalized(item?.name, contentLang);
  const description = getLocalized(item?.description, contentLang);
  const imgSrc = item?.img ? encodeURI(item.img) : '';
  const dateLabel = formatNewsDate(item);
  const viewsLabel = formatNewsViews(item?.views);

  return (
    <article className="news-card">
      <div className="news-card-media">
        {imgSrc ? (
          <img className="news-card-img" src={imgSrc} alt={name || ''} loading="lazy" />
        ) : (
          <div className="news-card-img news-card-img--empty" />
        )}
      </div>

      <div className="news-card-body">
        {name ? <h3 className="news-card-name">{name}</h3> : null}
        {description ? <p className="news-card-description">{description}</p> : null}

        <div className="news-card-date" aria-label="Sana va ko'rishlar">
          {dateLabel ? (
            <span className="news-card-date-meta" title="Yuklangan sana">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dateLabel}
            </span>
          ) : null}
          <span className="news-card-date-meta" title="Ko'rishlar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {viewsLabel}
          </span>
        </div>

        <button
          type="button"
          className="news-card-more"
          onClick={() => onReadMore?.(item)}
        >
          Batafsil o'qish
          <span aria-hidden>→</span>
        </button>
      </div>
    </article>
  );
};

export default NewsCard;
