import React from 'react';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import './NewsGridCard.css';
import './NewsGridCardSkeleton.css';

const NewsGridCardSkeleton = () => {
  return (
    <article className="news-grid-card news-grid-card--skeleton" aria-hidden>
      <div className="news-grid-card-media">
        <div className="news-grid-card-skel-media">
          <LoaderSkeleton variant="block" />
        </div>
      </div>

      <div className="news-grid-card-body">
        <LoaderSkeleton
          variant="text"
          className="news-grid-card-skel-name"
          width="90%"
        />
        <div className="news-grid-card-skel-description-wrap">
          <LoaderSkeleton
            variant="text"
            className="news-grid-card-skel-description"
            width="100%"
          />
          <LoaderSkeleton
            variant="text"
            className="news-grid-card-skel-description"
            width="82%"
          />
        </div>

        <div className="news-grid-card-meta news-grid-card-skel-meta">
          <LoaderSkeleton variant="text" width={78} />
          <LoaderSkeleton variant="text" width={48} />
        </div>

        <LoaderSkeleton
          variant="text"
          className="news-grid-card-skel-more"
          width={110}
        />
      </div>
    </article>
  );
};

export default NewsGridCardSkeleton;
