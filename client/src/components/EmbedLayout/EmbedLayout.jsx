import React, { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchModalAnons from '../SearchModalAnons/SearchModalAnons';
import SearchModalGenre from '../SearchModalGenre/SearchModalGenre';
import SearchModalResults from '../SearchModalResults/SearchModalResults';
import SearchModalTavsiya from '../SearchModalTavsiya/SearchModalTavsiya';
import KinoLogo from '../KinoLogo';
import './EmbedLayout.css';

export default function EmbedLayout() {
  const { t, i18n } = useTranslation();
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [params, setParams] = useSearchParams();
  const desktopInput = useRef(null);
  const mobileInput = useRef(null);
  const query = params.get('q') || '';
  const backLabel = i18n.resolvedLanguage === 'ru' ? 'Назад' : 'Orqaga';
  const searchLabel = t('navbar.search');
  const isHome = pathname === '/';
  const searchOpen = isHome && params.has('q');

  const closeSearch = useCallback(() => {
    if (state?.fromKinoSearchButton) {
      navigate(-1);
      return;
    }
    const nextParams = new URLSearchParams(params);
    nextParams.delete('q');
    setParams(nextParams, { replace: true, preventScrollReset: true });
  }, [navigate, params, setParams, state]);

  useEffect(() => {
    if (navigationType === 'PUSH') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const focusInput = () => {
      const input = window.matchMedia('(max-width: 768px)').matches ? mobileInput.current : desktopInput.current;
      input?.focus();
    };
    const focusFrame = window.requestAnimationFrame(focusInput);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeSearch, searchOpen]);

  function openSearch() {
    const nextParams = new URLSearchParams(params);
    nextParams.set('q', query);
    setParams(nextParams, { state: { fromKinoSearchButton: true }, preventScrollReset: true });
  }

  function updateQuery(value) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('q', value);
    setParams(nextParams, { replace: true, state, preventScrollReset: true });
  }

  function renderSearchContent() {
    if (query.trim()) {
      return <SearchModalResults query={query.trim()} onMovieClick={closeSearch} />;
    }
    return (
      <>
        <SearchModalGenre onGenreClick={closeSearch} />
        <SearchModalAnons onAnonsClick={closeSearch} />
        <SearchModalTavsiya onMovieClick={closeSearch} />
      </>
    );
  }

  if (!isHome) {
    if (!(window.history.state?.idx > 0)) return null;
    return (
      <header className="embed-catalog-header">
        <button className="embed-back-button" type="button" onClick={() => navigate(-1)}>
          {backLabel}
        </button>
      </header>
    );
  }

  return (
    <>
      <header className="embed-catalog-header embed-catalog-toolbar">
        <KinoLogo className="embed-kino-logo" />
        {searchOpen && (
          <div className="embed-desktop-search" role="search">
            <div className="embed-desktop-search-input-wrap">
              <input
                ref={desktopInput}
                type="search"
                aria-label={searchLabel}
                placeholder={searchLabel}
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
              />
              <button type="button" className="embed-search-clear" onClick={closeSearch} aria-label={backLabel}>
                {query.trim() ? '×' : '←'}
              </button>
            </div>
            <div className="embed-desktop-search-dropdown">{renderSearchContent()}</div>
          </div>
        )}
        <button
          className="embed-search-button"
          type="button"
          aria-label={searchLabel}
          aria-expanded={searchOpen}
          onClick={openSearch}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
        </button>
      </header>
      {searchOpen && (
        <div className="embed-mobile-search-overlay" onClick={closeSearch}>
          <div className="navbar-mobile-search-box embed-mobile-search-box" onClick={(event) => event.stopPropagation()}>
            <div className="navbar-mobile-search-form-row">
              <button type="button" className="navbar-mobile-search-back" onClick={closeSearch} aria-label={backLabel}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="navbar-mobile-search-form">
                <input
                  ref={mobileInput}
                  type="search"
                  aria-label={searchLabel}
                  placeholder={searchLabel}
                  value={query}
                  onChange={(event) => updateQuery(event.target.value)}
                  className="navbar-mobile-search-input"
                />
                <button type="button" className="navbar-mobile-search-icon-btn" onClick={() => updateQuery('')} aria-label={query.trim() ? 'Tozalash' : searchLabel}>
                  {query.trim() ? '×' : '⌕'}
                </button>
              </div>
            </div>
            {renderSearchContent()}
          </div>
        </div>
      )}
    </>
  );
}
