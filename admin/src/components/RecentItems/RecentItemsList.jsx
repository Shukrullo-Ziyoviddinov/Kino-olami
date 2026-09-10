import { useState } from 'react';
import ScrollTouch from '../ScrollTouch/ScrollTouch';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="100%" height="100%" fill="%23edf0f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23656d82" font-size="10">No img</text></svg>';

/** Sayt domeni — movie detail link uchun */
const SITE_BASE = (
  process.env.REACT_APP_SITE_URL ||
  process.env.REACT_APP_CLIENT_URL ||
  'https://www.chosontv.uz'
).replace(/\/$/, '');

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12zm3.46-7.12 1.41-1.41L12 11.59l1.13-1.12 1.41 1.41L13.41 13l1.13 1.12-1.41 1.41L12 14.41l-1.13 1.12-1.41-1.41L10.59 13l-1.13-1.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

function buildMovieShareUrl(item) {
  const id = Number(item?.id ?? item?.raw?.movieId ?? item?.raw?.id);
  if (!Number.isFinite(id) || id <= 0) return '';
  return `${SITE_BASE}/movie/${id}`;
}

async function copyText(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
}

export default function RecentItemsList({ items = [], loading = false, onEdit, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);

  const onCopyMovieLink = async (item) => {
    const url = buildMovieShareUrl(item);
    if (!url) return;
    try {
      await copyText(url);
      setCopiedId(item.id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === item.id ? null : prev));
      }, 1600);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return <div className="recent-items__empty">Yuklanmoqda...</div>;
  }

  if (!items.length) {
    return <div className="recent-items__empty">Maʼlumot topilmadi.</div>;
  }

  return (
    <ScrollTouch className="recent-items__table-wrap" allowInteractiveDrag>
      <table className="recent-items__table">
        <thead>
          <tr>
            <th>Soni</th>
            <th>Poster</th>
            <th>Nomi (UZ)</th>
            <th>Nomi (RU)</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {/** Eng yangisi tepada: 100 ta bo'lsa 100, 99, 98... */ }
          {items.map((item, index) => {
            const isMovie = item.section === 'movies';
            const canCopy = isMovie && Boolean(buildMovieShareUrl(item));
            const justCopied = copiedId === item.id;

            return (
              <tr key={`${item.id}-${index}`}>
                <td>{items.length - index}</td>
                <td>
                  <img
                    className="recent-items__poster"
                    src={item.image || PLACEHOLDER}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                </td>
                <td>{item.title || '-'}</td>
                <td>{item.subtitle || '-'}</td>
                <td>
                  <div className="recent-items__actions">
                    {canCopy ? (
                      <button
                        type="button"
                        className={`recent-items__icon-btn recent-items__icon-btn--copy${justCopied ? ' is-copied' : ''}`}
                        aria-label={justCopied ? 'Nusxa olindi' : 'Kino linkini nusxalash'}
                        title={justCopied ? 'Nusxa olindi' : 'Kino linkini nusxalash'}
                        onClick={() => onCopyMovieLink(item)}
                      >
                        {justCopied ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="recent-items__icon-btn"
                      aria-label="Tahrirlash"
                      onClick={() => onEdit?.(item)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className="recent-items__icon-btn recent-items__icon-btn--danger"
                      aria-label="O'chirish"
                      onClick={() => onDelete?.(item)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollTouch>
  );
}
