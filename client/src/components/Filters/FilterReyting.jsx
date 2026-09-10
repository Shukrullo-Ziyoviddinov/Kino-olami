import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './FilterReyting.css';

const RATING_FIELD = 'ratingImdb';

const FilterReyting = ({
  movies = [],
  selectedRating,
  onRatingSelect,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [modalTranslateY, setModalTranslateY] = useState(0);
  const modalRef = useRef(null);

  const uniqueRatings = [...new Set(
    movies
      .map((m) => m[RATING_FIELD])
      .filter((v) => v != null && v !== '' && v !== 'none')
  )].sort((a, b) => Number(b) - Number(a));

  const getRatingCount = (rating) =>
    movies.filter((m) => m[RATING_FIELD] === rating).length;

  const closeModal = () => setIsModalOpen(false);

  const handleRatingSelect = (rating) => {
    onRatingSelect(rating);
    closeModal();
  };

  const handleClearRating = () => {
    onRatingSelect(null);
    closeModal();
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
    setIsDraggingModal(true);
    setModalTranslateY(0);
  };

  const onTouchMove = (e) => {
    if (touchStart === null) return;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);
    const diff = currentY - touchStart;
    if (diff > 0) setModalTranslateY(diff);
  };

  const onTouchEnd = () => {
    setIsDraggingModal(false);
    setModalTranslateY(0);
    if (!touchStart || touchEnd === null) return;
    const distance = touchEnd - touchStart;
    if (distance > minSwipeDistance) closeModal();
  };

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  const typeLabel = t('filters.ratingTypes.imdb');

  return (
    <>
      <button type="button" className="filters-btn" onClick={() => setIsModalOpen(true)}>
        {selectedRating != null ? `${typeLabel}: ${selectedRating}` : t('detail.rating')}
      </button>

      {isModalOpen && createPortal(
        <div className="filters-modal-overlay" onClick={closeModal}>
          <div
            ref={modalRef}
            className={`filters-modal-reyting ${isDraggingModal ? 'filters-modal-reyting--dragging' : ''}`}
            style={isDraggingModal ? { transform: `translateY(${modalTranslateY}px)` } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="filters-modal-reyting-drag-area"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="filters-modal-reyting-drag-handle" />
              <div className="filters-modal-reyting-header">
                <h3 className="filters-modal-reyting-title">{t('detail.rating')}</h3>
                <button className="filters-modal-reyting-close" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="filters-modal-reyting-body">
              <button
                className={`filters-modal-reyting-option ${selectedRating === null ? 'filters-modal-reyting-option--active' : ''}`}
                onClick={handleClearRating}
              >
                {t('categories.all')} ({movies.length})
              </button>
              {uniqueRatings.map((rating) => (
                <button
                  key={rating}
                  className={`filters-modal-reyting-option ${selectedRating === rating ? 'filters-modal-reyting-option--active' : ''}`}
                  onClick={() => handleRatingSelect(rating)}
                >
                  {rating} ({getRatingCount(rating)})
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FilterReyting;
