import React from 'react';
import { RANK_DIGIT_HEIGHT, RANK_DIGIT_PATHS } from './rankDigitPaths';
import './WeeklyTopRank.css';

const GAP = -2;

const buildRankLayout = (rank) => {
  const digits = String(Math.min(10, Math.max(1, Number(rank) || 1))).split('');
  let offsetX = 0;
  const glyphs = [];

  digits.forEach((digit, index) => {
    const glyph = RANK_DIGIT_PATHS[digit];
    if (!glyph) return;

    glyphs.push({
      key: `${digit}-${index}`,
      d: glyph.d,
      x: offsetX,
    });
    offsetX += glyph.width + (index < digits.length - 1 ? GAP : 0);
  });

  return { width: Math.max(offsetX, 1), glyphs };
};

const WeeklyTopRank = ({ rank, className = '' }) => {
  const { width, glyphs } = buildRankLayout(rank);

  return (
    <span className={`weekly-top-rank ${className}`.trim()} aria-hidden="true">
      <svg
        className="weekly-top-rank__svg"
        viewBox={`0 0 ${width} ${RANK_DIGIT_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <g className="weekly-top-rank__stroke">
          {glyphs.map((glyph) => (
            <path
              key={`stroke-${glyph.key}`}
              d={glyph.d}
              transform={`translate(${glyph.x} 0)`}
              fillRule="evenodd"
            />
          ))}
        </g>
        <g className="weekly-top-rank__fill">
          {glyphs.map((glyph) => (
            <path
              key={`fill-${glyph.key}`}
              d={glyph.d}
              transform={`translate(${glyph.x} 0)`}
              fillRule="evenodd"
            />
          ))}
        </g>
      </svg>
    </span>
  );
};

export default WeeklyTopRank;
