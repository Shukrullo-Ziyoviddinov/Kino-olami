import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ActorsInfoModal.css';

const CLOSE_MS = 240;

const ActorsInfoModal = ({ title, text, onClose }) => {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => onClose?.(), CLOSE_MS);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [requestClose]);

  return (
    <div className={`actors-info-modal-root${closing ? ' is-closing' : ''}`}>
      <div
        className="actors-info-modal-overlay"
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        className="actors-info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="actors-info-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="actors-info-modal-header">
          <h3 id="actors-info-modal-title" className="actors-info-modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="actors-info-modal-close"
            onClick={requestClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="actors-info-modal-body">
          <p className="actors-info-modal-text">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default ActorsInfoModal;
