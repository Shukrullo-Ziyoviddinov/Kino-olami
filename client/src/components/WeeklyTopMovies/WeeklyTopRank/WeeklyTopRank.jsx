import React from 'react';
import { RANK_DIGIT_HEIGHT, RANK_DIGIT_PATHS } from './rankDigitPaths';
import './WeeklyTopRank.css';

const GAP = 4;

const buildRankSvg = (rank) => {
  const digits = String(Math.min(10, Math.max(1, Number(rank) || 1))).split('');
  let offsetX = 0;
  const nodes = [];

  digits.forEach((digit, index) => {
    const glyph = RANK_DIGIT_PATHS[digit];
    if (!glyph) return;

    nodes.push(
      <path
        key={`${digit}-${index}`}
        className="weekly-top-rank__path"
        d={glyph.d}
        transform={`translate(${offsetX} 0)`}
      />
    );
    offsetX += glyph.width + (index < digits.length - 1 ? GAP : 0);
  });

  return { width: Math.max(offsetX, 1), nodes };
};

const WeeklyTopRank = ({ rank, className = '' }) => {
  const { width, nodes } = buildRankSvg(rank);

  return (
    <span className={`weekly-top-rank ${className}`.trim()} aria-hidden="true">
      <svg
        className="weekly-top-rank__svg"
        viewBox={`0 0 ${width} ${RANK_DIGIT_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        {nodes}
      </svg>
    </span>
  );
};

export default WeeklyTopRank;
