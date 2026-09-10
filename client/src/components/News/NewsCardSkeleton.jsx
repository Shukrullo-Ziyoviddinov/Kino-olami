import React from 'react';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import './NewsCard.css';
import './NewsCardSkeleton.css';

const NewsCardSkeleton = () => {
  return (
    <article className="news-card news-card--skeleton" aria-hidden>
      <div className="news-card-media">
        <div className="news-card-skel-media">
          <LoaderSkeleton variant="block" />
        </div>
      </div>

      <div className="news-card-body">
        <LoaderSkeleton
          variant="text"
          className="news-card-skel-name"
          width="88%"
        />
        <div className="news-card-skel-description-wrap">
          <LoaderSkeleton variant="text" className="news-card-skel-description" width="100%" />
          <LoaderSkeleton variant="text" className="news-card-skel-description" width="94%" />
          <LoaderSkeleton variant="text" className="news-card-skel-description" width="86%" />
        </div>

        <div className="news-card-date news-card-skel-date">
          <LoaderSkeleton variant="text" width={88} />
          <LoaderSkeleton variant="text" width={54} />
        </div>

        <LoaderSkeleton
          variant="text"
          className="news-card-skel-more"
          width={120}
        />
      </div>
    </article>
  );
};

export default NewsCardSkeleton;
