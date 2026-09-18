import React from 'react';
import { formatViewCount } from './formatViewCount';
import './MostViewedViewsBadge.css';

/**
 * Poster pastidagi meta: #rank + uniqueUsers.
 * WeeklyTop SVG rank emas — oddiy strip + eye ikonka.
 */
const MostViewedViewsBadge = ({ rank, uniqueUsers = 0, className = '' }) => {
  const safeRank = Number.isFinite(Number(rank)) && Number(rank) > 0 ? Math.floor(Number(rank)) : null;
  const viewsLabel = formatViewCount(uniqueUsers);

  return (
    <div className={`most-viewed-badge ${className}`.trim()} aria-hidden="true">
      {safeRank != null && <span className="most-viewed-badge-rank">#{safeRank}</span>}
      <span className="most-viewed-badge-views">
        <svg className="most-viewed-badge-eye" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
        {viewsLabel}
      </span>
    </div>
  );
};

export default MostViewedViewsBadge;
