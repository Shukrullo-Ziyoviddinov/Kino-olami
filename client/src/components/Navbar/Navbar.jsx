import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import LanguageModal from './LanguageModal';
import SearchModalGenre from '../SearchModalGenre/SearchModalGenre';
import SearchModalAnons from '../SearchModalAnons/SearchModalAnons';
import SearchModalTavsiya from '../SearchModalTavsiya/SearchModalTavsiya';
import SearchModalResults from '../SearchModalResults/SearchModalResults';
import { isAuthenticated } from '../../utils/authStorage';
import { useAuthModal } from '../../context/AuthModalContext';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const languageWrapperRef = useRef(null);
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  const updateModalPosition = () => {
    if (modalRef.current && searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      modalRef.current.style.setProperty('--modal-top', `${rect.bottom + 8}px`);
      modalRef.current.style.setProperty('--modal-left', `${rect.left + rect.width / 2}px`);
      modalRef.current.style.setProperty('--modal-width', `${rect.width}px`);
    }
  };

  const languages = [
    { code: 'uz', image: '/img/uzb-by.jpg' },
    { code: 'ru', image: '/img/rubay.png' }
  ];

  const getCurrentLanguage = () => {
    let lang = i18n.language || localStorage.getItem('i18nextLng') || 'uz';
    
    if (lang && typeof lang === 'string') {
      lang = lang.toLowerCase().split('-')[0];
    }
    
    if (lang === 'uz' || lang === 'ru') {
      return lang;
    }
    return 'uz';
  };

  const currentLanguage = getCurrentLanguage();
  const currentLanguageImage = languages.find(lang => lang.code === currentLanguage)?.image || languages[0].image;

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || 'uz';
    if (savedLanguage === 'uz' || savedLanguage === 'ru') {
      i18n.changeLanguage(savedLanguage);
    } else {
      i18n.changeLanguage('uz');
      localStorage.setItem('i18nextLng', 'uz');
    }
  }, [i18n]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageWrapperRef.current && !languageWrapperRef.current.contains(event.target)) {
        setShowLanguageModal(false);
      }
    };

    if (showLanguageModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageModal]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowSearchModal(false);
    };
    if (showSearchModal) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSearchModal]);

  useEffect(() => {
    if (!showSearchModal) return;
    updateModalPosition();
    const handleResize = () => updateModalPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSearchModal]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openSearch') !== '1') {
      return;
    }

    const isTelegram = Boolean(window.Telegram?.WebApp);
    const isNarrow = window.matchMedia('(max-width: 768px)').matches;

    // Telegram yoki mobil: pastki qidiruv; desktop brauzer: yuqori modal
    if (isTelegram || isNarrow) {
      window.dispatchEvent(new CustomEvent('open-mobile-search'));
    } else {
      setShowSearchModal(true);
    }

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

  const handleLanguageChange = (langCode) => {
    if (langCode === 'uz' || langCode === 'ru') {
      i18n.changeLanguage(langCode);
      localStorage.setItem('i18nextLng', langCode);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Enter bosilganda sahifaga o'tmaslik, natijalar modaldagi qoladi
  };

  const openSearchModal = () => {
    setShowSearchModal(true);
  };

  const openMobileSearch = () => {
    window.dispatchEvent(new CustomEvent('open-mobile-search'));
  };

  const handleProfileClick = () => {
    if (!isAuthenticated()) {
      openAuthModal({ redirectToProfile: true });
      return;
    }
    navigate('/profile');
  };

  return (
    <>
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo" onClick={() => navigate('/')}>
            <img src="/img/chosontv_preview_rev_1.png" alt="CHOSON.TV" className="navbar-logo-img" />
          </div>
          <button
            className="navbar-mobile-search-trigger"
            onClick={openMobileSearch}
            aria-label={t('navbar.search')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        <div className="navbar-center navbar-desktop-only">
          <form onSubmit={handleSearch} className="navbar-search">
            <div className="navbar-search-wrap" ref={searchInputRef}>
              <>
              <input
                type="text"
                placeholder={t('navbar.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={openSearchModal}
                className="navbar-search-input"
              />
              <button
                type="button"
                className="navbar-search-icon"
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
              </>
            </div>
          </form>
        </div>

        <div className="navbar-right">
          <>
          <button
            className={`navbar-icon-btn navbar-desktop-only${location.pathname === '/news' ? ' navbar-icon-btn--active' : ''}`}
            onClick={() => navigate('/news')}
            aria-label={t('navbar.news')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
            </svg>
          </button>

          <button
            className={`navbar-icon-btn navbar-desktop-only${location.pathname === '/wishlist' ? ' navbar-icon-btn--active' : ''}`}
            onClick={() => navigate('/wishlist')}
            aria-label={t('navbar.favorites')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <button
            className="navbar-icon-btn navbar-desktop-only"
            onClick={handleProfileClick}
            aria-label={t('navbar.profile')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          <div className="navbar-language-wrapper" ref={languageWrapperRef}>
            <button
              className="navbar-language-btn"
              onClick={() => setShowLanguageModal(!showLanguageModal)}
              aria-label="Language"
            >
              <img
                src={currentLanguageImage}
                alt="Language"
                className="navbar-language-flag-image"
              />
            </button>
            {showLanguageModal && (
              <LanguageModal
                onClose={() => setShowLanguageModal(false)}
                onLanguageChange={handleLanguageChange}
                currentLanguage={currentLanguage}
              />
            )}
          </div>
          </>
        </div>
      </div>
    </nav>

    {showSearchModal && (
      <div
          className="navbar-search-modal-overlay"
          onClick={(e) => {
            if (!e.target.closest('.navbar-search-modal')) setShowSearchModal(false);
          }}
        >
        <div
          ref={modalRef}
          className="navbar-search-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="navbar-search-modal-inner">
            <div
              className={`navbar-search-modal-form-row ${searchQuery.trim() ? 'navbar-search-modal-form-row--has-query' : ''}`}
            >
              <button
                type="button"
                className="navbar-search-modal-back"
                onClick={() => setShowSearchModal(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <form onSubmit={handleSearch} className="navbar-search-modal-form navbar-search-modal-form-mobile">
                <div className="navbar-search-input-wrap">
                  <input
                    type="text"
                    placeholder={t('navbar.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="navbar-search-input"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="navbar-search-icon-btn"
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
            {searchQuery.trim() ? (
              <SearchModalResults
                query={searchQuery.trim()}
                onMovieClick={() => setShowSearchModal(false)}
              />
            ) : (
              <>
                <SearchModalGenre onGenreClick={() => setShowSearchModal(false)} />
                <SearchModalAnons onAnonsClick={() => setShowSearchModal(false)} />
                <SearchModalTavsiya onMovieClick={() => setShowSearchModal(false)} />
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;
