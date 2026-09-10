import { useEffect } from 'react';
import './ElementAddModal.css';

function BackIcon() {
  return (
    <svg className="element-add-modal__back-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
      />
    </svg>
  );
}

export default function ElementAddModal({ isOpen, title, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="element-add-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="element-add-modal__backdrop"
        aria-label="Modalni yopish"
        onClick={onClose}
      />
      <div className="element-add-modal__panel">
        <div className="element-add-modal__header">
          <button
            type="button"
            className="element-add-modal__back-btn"
            aria-label="Ortga"
            onClick={onClose}
          >
            <BackIcon />
          </button>
          <h2 className="element-add-modal__title">{title}</h2>
        </div>
        <div className="element-add-modal__body">{children}</div>
      </div>
    </div>
  );
}
