import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';
import { useMoviesCatalog } from '../context/MoviesCatalogContext';
import Movies from '../components/Movies/Movies';
import './WishlistPage.css';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { wishlistIds } = useWishlist();
  const { allMovies, isLoading: wishlistLoading, ensureFullCatalog } = useMoviesCatalog();

  useEffect(() => {
    ensureFullCatalog();
  }, [ensureFullCatalog]);

  const wishlistMovies = allMovies.filter((m) => wishlistIds.includes(m.id));
  const isEmpty = wishlistMovies.length === 0;

  if (wishlistLoading) {
    return (
      <div className="wishlist-page">
        <Movies
          sectionType="wishlist"
          limit={null}
          filteredMovies={[]}
          hideHeader
          isLoading
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="wishlist-page wishlist-page--empty">
        <div className="wishlist-empty">
          <div className="wishlist-empty-img" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p className="wishlist-empty-text">
            {t('wishlist.emptyText')}
          </p>
          <button
            className="wishlist-empty-btn"
            onClick={() => navigate('/')}
          >
            {t('wishlist.goToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Movies
        sectionType="wishlist"
        limit={null}
        filteredMovies={wishlistMovies}
        hideHeader
        isLoading={wishlistLoading}
      />
    </div>
  );
};

export default WishlistPage;
