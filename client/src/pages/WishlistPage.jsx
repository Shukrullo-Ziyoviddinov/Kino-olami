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
          <img
            src="/img/wishlist_preview_rev_1.png"
            alt={t('wishlist.emptyText')}
            className="wishlist-empty-img"
          />
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
