import React, { useEffect, useState } from 'react';
import { useContentLanguage } from '../../context/ContentLanguageContext';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import './TrillerCart.css';

const getLocalized = (value, lang) => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.uz || value.ru || '';
  }
  return String(value);
};

const TrillerCart = ({ item, onClick, isDataLoading = false }) => {
  const { contentLang } = useContentLanguage();
  const name = getLocalized(item?.name, contentLang);
  const description = getLocalized(item?.description, contentLang);
  const imgSrc = item?.img ? encodeURI(item.img) : '';
  const [isImageLoaded, setIsImageLoaded] = useState(!imgSrc);

  useEffect(() => {
    setIsImageLoaded(!imgSrc);
  }, [imgSrc]);

  const showLoading = isDataLoading || (imgSrc ? !isImageLoaded : false);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleImageError = (event) => {
    event.currentTarget.classList.add('triller-cart-img--empty');
    setIsImageLoaded(true);
  };

  return (
    <button
      type="button"
      className="triller-cart"
      onClick={() => !showLoading && onClick?.(item)}
      aria-label={name || 'Triller'}
      disabled={showLoading}
    >
      <div className="triller-cart-media">
        {showLoading && (
          <LoaderSkeleton variant="image" className="triller-cart-media-skeleton" />
        )}
        {imgSrc && !isDataLoading ? (
          <img
            src={imgSrc}
            alt={name || 'Triller'}
            className={`triller-cart-img ${showLoading ? 'is-loading' : ''}`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : null}
        {!imgSrc && !isDataLoading ? (
          <div className="triller-cart-img triller-cart-img--empty" />
        ) : null}
        {!showLoading ? (
          <span className="triller-cart-play" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          </span>
        ) : null}
      </div>
      {showLoading ? (
        <>
          <LoaderSkeleton
            variant="text"
            className="triller-cart-name-skeleton"
            width="75%"
            height={18}
          />
          <LoaderSkeleton
            variant="text"
            className="triller-cart-description-skeleton"
            width="100%"
            height={14}
          />
          <LoaderSkeleton
            variant="text"
            className="triller-cart-description-skeleton triller-cart-description-skeleton--second"
            width="88%"
            height={14}
          />
        </>
      ) : (
        <>
          {name ? <p className="triller-cart-name">{name}</p> : null}
          {description ? <p className="triller-cart-description">{description}</p> : null}
        </>
      )}
    </button>
  );
};

export default TrillerCart;
