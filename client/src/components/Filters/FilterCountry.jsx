import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './FilterCountry.css';

const FilterCountry = ({ movies = [], selectedCountry, onCountrySelect }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [modalTranslateY, setModalTranslateY] = useState(0);
  const modalRef = useRef(null);

  const normalizeFilterValue = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[’ʻʼ`]/g, "'");

  const uniqueCountries = Array.from(
    new Map(
      movies
        .map((m) => m.filterCountry)
        .filter(Boolean)
        .map((country) => [normalizeFilterValue(country), country])
    ).values()
  ).sort();

  const getCountryCount = (country) => {
    const normalizedCountry = normalizeFilterValue(country);
    return movies.filter((m) => normalizeFilterValue(m.filterCountry) === normalizedCountry).length;
  };

  const closeModal = () => setIsModalOpen(false);

  const handleCountrySelect = (country) => {
    onCountrySelect(country);
    closeModal();
  };

  const handleClearCountry = () => {
    onCountrySelect(null);
    closeModal();
  };

  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.dataset.filtersModalScrollY = String(scrollY);
    } else {
      const scrollY = parseInt(document.body.dataset.filtersModalScrollY || '0', 10);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      delete document.body.dataset.filtersModalScrollY;
      window.scrollTo(0, scrollY);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      const scrollY = parseInt(document.body.dataset.filtersModalScrollY || '0', 10);
      delete document.body.dataset.filtersModalScrollY;
      window.scrollTo(0, scrollY);
    };
  }, [isModalOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (touchStart === null) return;
    const currentTouch = e.touches[0].clientY;
    const diff = currentTouch - touchStart;
    if (diff > 0) {
      setIsDraggingModal(true);
      setModalTranslateY(diff);
      setTouchEnd(currentTouch);
    } else {
      setIsDraggingModal(false);
      setModalTranslateY(0);
      setTouchStart(null);
      setTouchEnd(null);
    }
  };

  const handleTouchEnd = () => {
    if (touchStart === null) {
      setIsDraggingModal(false);
      setModalTranslateY(0);
      return;
    }
    const distance = touchEnd !== null ? touchEnd - touchStart : 0;
    if (distance <= 0) {
      setIsDraggingModal(false);
      setModalTranslateY(0);
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    const modalHeight = modalRef.current ? modalRef.current.offsetHeight : 300;
    const closeThreshold = modalHeight * 0.35;
    if (distance > closeThreshold) {
      closeModal();
    }
    setIsDraggingModal(false);
    setModalTranslateY(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <>
      <button
        className={`filters-btn ${selectedCountry !== null ? 'filters-btn--active' : ''}`}
        onClick={() => setIsModalOpen(true)}
      >
        {t('filters.country', 'Mamlakat')}
        {selectedCountry !== null && (
          <span className="filters-btn-badge">{t(`filters.countries.${selectedCountry}`, selectedCountry)}</span>
        )}
      </button>

      {isModalOpen && createPortal(
        <div
          className="filters-modal-overlay"
          onClick={handleOverlayClick}
        >
          <div
            ref={modalRef}
            className={`filters-modal-country ${isDraggingModal ? 'filters-modal-country--dragging' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ transform: `translateY(${modalTranslateY}px)` }}
          >
            <div
              className="filters-modal-country-drag-area"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="filters-modal-country-drag-handle" />
              <div className="filters-modal-country-header">
                <h3 className="filters-modal-country-title">{t('filters.country', 'Mamlakat')}</h3>
                <button className="filters-modal-country-close" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="filters-modal-country-body">
              <button
                className={`filters-modal-country-option ${selectedCountry === null ? 'filters-modal-country-option--active' : ''}`}
                onClick={handleClearCountry}
              >
                {t('categories.all')} ({movies.length})
              </button>
              {uniqueCountries.map((country) => (
                <button
                  key={country}
                  className={`filters-modal-country-option ${selectedCountry === country ? 'filters-modal-country-option--active' : ''}`}
                  onClick={() => handleCountrySelect(country)}
                >
                  {t(`filters.countries.${country}`, country)} ({getCountryCount(country)})
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

export default FilterCountry;
