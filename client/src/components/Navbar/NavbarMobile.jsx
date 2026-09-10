import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchModalGenre from '../SearchModalGenre/SearchModalGenre';
import SearchModalAnons from '../SearchModalAnons/SearchModalAnons';
import SearchModalTavsiya from '../SearchModalTavsiya/SearchModalTavsiya';
import SearchModalResults from '../SearchModalResults/SearchModalResults';
import { isAuthenticated } from '../../utils/authStorage';
import { useAuthModal } from '../../context/AuthModalContext';
import { pushTelegramOverlayClose, popTelegramOverlayClose } from '../TelegramBackButton/TelegramBackButton';
import './NavbarMobile.css';

const NavbarMobile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const location = useLocation();
  const pathname = location.pathname;
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const closedByPopstateRef = useRef(false);
  const ignoreNextHistoryCleanupRef = useRef(false);

  useEffect(() => {
    const openMobileSearch = () => setShowSearch(true);
    window.addEventListener('open-mobile-search', openMobileSearch);
    return () => window.removeEventListener('open-mobile-search', openMobileSearch);
  }, []);

  // Telegram ← / qurilma orqaga: faqat search modal yopiladi
  useEffect(() => {
    if (!showSearch) return undefined;

    closedByPopstateRef.current = false;
    window.history.pushState({ mobileSearch: true }, '');

    const closeSearch = () => setShowSearch(false);
    const tgHandler = () => closeSearch();
    pushTelegramOverlayClose(tgHandler);

    const onPopState = () => {
      closedByPopstateRef.current = true;
      closeSearch();
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      popTelegramOverlayClose(tgHandler);
      window.removeEventListener('popstate', onPopState);
      if (ignoreNextHistoryCleanupRef.current) {
        ignoreNextHistoryCleanupRef.current = false;
        return;
      }
      if (!closedByPopstateRef.current) {
        window.history.back();
      }
    };
  }, [showSearch]);

  const isHomeActive = pathname === '/';
  const isSearchActive = pathname.startsWith('/search');
  const isNewsActive = pathname === '/news' || pathname.startsWith('/news/');
  const isWishlistActive = pathname === '/wishlist';
  const isProfileActive = pathname === '/profile';

  const hasSearchQuery = searchQuery.trim().length > 0;

  const closeSearchAfterNavigation = () => {
    ignoreNextHistoryCleanupRef.current = true;
    setShowSearch(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openSearch') !== '1') {
      return;
    }

    // URL orqali ochilganda history.back() trap bilan urilmasin
    ignoreNextHistoryCleanupRef.current = true;
    setShowSearch(true);

    params.delete('openSearch');
    params.delete('source');
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  const handleProfileClick = () => {
    if (!isAuthenticated()) {
      openAuthModal({ redirectToProfile: true });
      return;
    }
    navigate('/profile');
  };

  return (
    <>
      <nav className="navbar-mobile">
        <>
        <button
          className={`navbar-mobile-item ${isHomeActive ? 'navbar-mobile-item-active' : ''}`}
          onClick={() => navigate('/')}
          aria-label={t('navbar.home')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>{t('navbar.home')}</span>
        </button>

        <button
          className={`navbar-mobile-item ${isSearchActive ? 'navbar-mobile-item-active' : ''}`}
          onClick={() => setShowSearch(true)}
          aria-label={t('navbar.search')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>{t('navbar.search').replace('...', '')}</span>
        </button>

        <button
          className={`navbar-mobile-item ${isNewsActive ? 'navbar-mobile-item-active' : ''}`}
          onClick={() => navigate('/news')}
          aria-label={t('navbar.news')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
          </svg>
          <span>{t('navbar.news')}</span>
        </button>

        <button
          className={`navbar-mobile-item ${isWishlistActive ? 'navbar-mobile-item-active' : ''}`}
          onClick={() => navigate('/wishlist')}
          aria-label={t('navbar.favorites')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{t('navbar.favorites')}</span>
        </button>

        <button
          className={`navbar-mobile-item ${isProfileActive ? 'navbar-mobile-item-active' : ''}`}
          onClick={handleProfileClick}
          aria-label={t('navbar.profile')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{t('navbar.profile')}</span>
        </button>
        </>
      </nav>

      {showSearch && (
        <div
          className="navbar-mobile-search-overlay"
          onClick={(e) => {
            if (!e.target.closest('.navbar-mobile-search-box')) setShowSearch(false);
          }}
        >
          <div
            className="navbar-mobile-search-box"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="navbar-mobile-search-form-row">
              <button type="button" className="navbar-mobile-search-back" onClick={() => setShowSearch(false)} aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <form onSubmit={handleSearchSubmit} className="navbar-mobile-search-form">
              <div className="navbar-mobile-search-input-wrap">
                <input
                  type="text"
                  placeholder={t('navbar.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="navbar-mobile-search-input"
                />
                <button
                  type="button"
                  className="navbar-mobile-search-icon-btn"
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                  aria-label={searchQuery.trim() ? 'Tozalash' : t('navbar.search')}
                >
                  {searchQuery.trim() ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  )}
                </button>
              </div>
              </form>
            </div>
            {hasSearchQuery ? (
              <SearchModalResults
                query={searchQuery.trim()}
                onMovieClick={closeSearchAfterNavigation}
              />
            ) : (
              <>
                <SearchModalGenre onGenreClick={closeSearchAfterNavigation} />
                <SearchModalAnons onAnonsClick={closeSearchAfterNavigation} />
                <SearchModalTavsiya onMovieClick={closeSearchAfterNavigation} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarMobile;
