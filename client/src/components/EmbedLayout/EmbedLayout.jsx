import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchModalResults from '../SearchModalResults/SearchModalResults';
import KinoLogo from '../KinoLogo';
import './EmbedLayout.css';

export default function EmbedLayout() {
  const { t, i18n } = useTranslation();
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [params, setParams] = useSearchParams();
  const dialog = useRef(null);
  const query = params.get('q') || '';
  const backLabel = i18n.resolvedLanguage === 'ru' ? 'Назад' : 'Orqaga';
  const searchLabel = t('navbar.search');
  const isHome = pathname === '/';
  const searchOpen = isHome && params.has('q');

  useEffect(() => {
    if (navigationType === 'PUSH') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  useEffect(() => {
    const element = dialog.current;
    if (!searchOpen || !element || element.open) return;
    element.showModal();
    element.querySelector('input[type="search"]')?.focus();
  }, [searchOpen]);

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

  function closeSearch() {
    if (state?.fromKinoSearchButton) {
      navigate(-1);
      return;
    }
    const nextParams = new URLSearchParams(params);
    nextParams.delete('q');
    setParams(nextParams, { replace: true, preventScrollReset: true });
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
        <button
          className="embed-search-button"
          type="button"
          aria-label={searchLabel}
          aria-haspopup="dialog"
          onClick={openSearch}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
        </button>
      </header>
      {searchOpen && (
        <dialog
          ref={dialog}
          className="embed-search-dialog"
          aria-label={searchLabel}
          onCancel={(event) => {
            event.preventDefault();
            closeSearch();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
        >
          <div className="embed-search-panel">
            <div className="embed-search-row">
              <button className="embed-search-button" type="button" onClick={closeSearch} aria-label={backLabel}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5m7-7-7 7 7 7" />
                </svg>
              </button>
              <input
                type="search"
                aria-label={searchLabel}
                placeholder={searchLabel}
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
              />
            </div>
            {query.trim() && <SearchModalResults query={query.trim()} />}
          </div>
        </dialog>
      )}
    </>
  );
}
