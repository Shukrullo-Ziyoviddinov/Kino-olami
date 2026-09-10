import React from 'react';
import './LoaderSkeleton.css';

/**
 * LoaderSkeleton - Backend loading holatida skeleton loader
 * variant: 'image' | 'text' | 'button' | 'avatar' | 'search' | 'logo' | 'icon' | 'block' | 'movie-card' | 'profile-top' | 'wishlist-block' | 'detail-image' | 'detail-title' | 'detail-specs' | 'detail-actions'
 */
const LoaderSkeleton = ({ variant = 'block', className = '', width, height, count = 1 }) => {
  const baseClass = 'loader-skeleton';
  const variantClass = `loader-skeleton--${variant}`;

  const renderSkeleton = () => {
    switch (variant) {
      case 'image':
      case 'movie-card':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--image`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'text':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--text`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'button':
      case 'more-btn':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--button`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'avatar':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--avatar`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'search':
      case 'navbar-search':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--search`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'logo':
      case 'navbar-logo':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--logo`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'icon':
      case 'navbar-icon':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--icon`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'language-btn':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--language-btn`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'profile-top':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--profile-top`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'wishlist-block':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--wishlist-block`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'detail-image':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--detail-image`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'detail-title':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--detail-title`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'detail-specs':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--detail-specs`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'detail-actions':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--detail-actions`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'banner-image':
      case 'manga-image':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--banner-image`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'categories-item':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--categories-item`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'wishlist-empty-img':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--wishlist-empty-img`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'wishlist-empty-btn':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--wishlist-empty-btn`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'app-store-img':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--app-store-img`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'detail-description':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--detail-description`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'detail-description-more-btn':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--detail-description-more-btn`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'seasons-tab':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--seasons-tab`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'season-btn':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--season-btn`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'episode-video':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--episode-video`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'actor-item':
      case 'movie-detail-actor-item':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--actor-item`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'similar-movies-item-image':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--similar-movies-item-image`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'similar-movies-title':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--similar-movies-title`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'comments-title':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--comments-title`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'comments-input-wrap':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--comments-input-wrap`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'comments-modal':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--comments-modal`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'description-modal-content':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--description-modal-content`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'description-modal-info':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--description-modal-info`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'description-modal-info-item':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--description-modal-info-item`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'description-modal-close':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--description-modal-close`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'filters-btn':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--filters-btn`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'actors-page-back':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--actors-page-back`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'actors-page-image':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--actors-page-image`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'actors-page-name':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--actors-page-name`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'actors-page-desc':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--actors-page-desc`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'actors-page-profile':
        return (
          <div className={`${baseClass} ${variantClass} loader-skeleton--actors-page-profile`} style={{ width }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
      case 'block':
      default:
        return (
          <div className={`${baseClass} ${variantClass}`} style={{ width, height }}>
            <span className="loader-skeleton__shimmer" aria-hidden="true" />
          </div>
        );
    }
  };

  if (count > 1) {
    return (
      <div className={`loader-skeleton-group ${className}`.trim()}>
        {Array.from({ length: count }).map((_, i) => (
          <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
        ))}
      </div>
    );
  }

  const skeleton = renderSkeleton();
  if (className) {
    return <div className={className}>{skeleton}</div>;
  }
  return skeleton;
};

export default LoaderSkeleton;
