import React, { useCallback, useEffect, useRef } from 'react';
import { matchPath, useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchModalAnons from '../SearchModalAnons/SearchModalAnons';
import SearchModalGenre from '../SearchModalGenre/SearchModalGenre';
import SearchModalResults from '../SearchModalResults/SearchModalResults';
import SearchModalTavsiya from '../SearchModalTavsiya/SearchModalTavsiya';
import KinoLogo from '../KinoLogo';
import useNativeMenuSwipe from '../../hooks/useNativeMenuSwipe';
import { usesMoviySession } from '../../utils/moviyBridge';
import './EmbedLayout.css';

export default function EmbedLayout() {
  useNativeMenuSwipe();
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
  const isMoviyWishlist = usesMoviySession && Boolean(matchPath('/wishlist', pathname));
  const isMovieDetail = Boolean(matchPath('/movie/:id', pathname));
  const isActorPage = Boolean(matchPath('/actor/:id', pathname));
  const isSection = Boolean(matchPath('/recommended', pathname) || matchPath('/category/:categoryId', pathname));
  const canGoBack = window.history.state?.idx > 0;
  const searchOpen = (isHome || isSection || isMoviyWishlist) && params.has('q');

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
    // Outside home, search results navigate away from the modal URL themselves.
    const closeOnSelect = isHome ? closeSearch : undefined;
    if (query.trim()) {
      return <SearchModalResults query={query.trim()} onMovieClick={closeOnSelect} />;
    }
    return (
      <>
        <SearchModalGenre onGenreClick={closeOnSelect} />
        <SearchModalAnons onAnonsClick={closeOnSelect} />
        <SearchModalTavsiya onMovieClick={closeOnSelect} />
      </>
    );
  }

  if (isMovieDetail) return null;

  const toolbarClass = isSection ? ' embed-section-wide-toolbar' : isMoviyWishlist ? ' embed-wishlist-toolbar' : '';
  return (
    <>
      {(isHome || isSection || isMoviyWishlist) && (
        <header className={`embed-catalog-header embed-catalog-toolbar${toolbarClass}`}>
          <KinoLogo className="embed-kino-logo" />
          {searchOpen && (
            <div className="embed-desktop-search" role="search">
              <div className="embed-desktop-search-row">
                <button type="button" className="embed-desktop-search-back" onClick={closeSearch} aria-label={backLabel}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <div className="embed-desktop-search-input-wrap">
                  <input
                    ref={desktopInput}
                    type="search"
                    aria-label={searchLabel}
                    placeholder={searchLabel}
                    value={query}
                    onChange={(event) => updateQuery(event.target.value)}
                  />
                </div>
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
          {usesMoviySession && !isMoviyWishlist && (
            <button className="embed-desktop-wishlist embed-search-button" type="button"
              aria-label={t('navbar.favorites')} onClick={() => navigate('/wishlist')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
              </svg>
            </button>
          )}
        </header>
      )}
      {!isHome && !isActorPage && !isMoviyWishlist && (
        <>
          {canGoBack && (
            <header className={`embed-catalog-header${isSection ? ' embed-section-desktop-header' : ''}`}>
              <button className="embed-back-button" type="button" onClick={() => navigate(-1)}>
                {backLabel}
              </button>
            </header>
          )}
          {isSection && (
            <header className="embed-catalog-header embed-section-mobile-header">
              <button
                type="button"
                className="embed-section-back"
                aria-label={backLabel}
                onClick={() => canGoBack ? navigate(-1) : navigate('/')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="embed-section-search"
                aria-haspopup="dialog"
                aria-expanded={searchOpen}
                onClick={openSearch}
              >
                {searchLabel}
              </button>
            </header>
          )}
        </>
      )}
      {searchOpen && (
        <div className="embed-mobile-search-overlay" onClick={closeSearch}>
          <div className="navbar-mobile-search-box embed-mobile-search-box" role="dialog" aria-modal="true" aria-label={searchLabel} onClick={(event) => event.stopPropagation()}>
            <div className="navbar-mobile-search-form-row">
              <button type="button" className="navbar-mobile-search-back" onClick={closeSearch} aria-label={backLabel}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
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
            {renderSearchContent()}
          </div>
        </div>
      )}
    </>
  );
}
