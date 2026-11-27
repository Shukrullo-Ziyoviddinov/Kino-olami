import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';
import { useMoviesCatalog } from '../context/MoviesCatalogContext';
import Movies from '../components/Movies/Movies';
import SiginModal from '../components/SiginModal/SiginModal';
import { fetchMovieById } from '../api/moviesApi';
import { isAuthenticated, subscribeToAuthSession } from '../utils/authStorage';
import { sendMoviyMessage, usesMoviySession } from '../utils/moviyBridge';
import './WishlistPage.css';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { wishlistIds, moviyLinked } = useWishlist();
  const { allMovies, isLoading: wishlistLoading, ensureFullCatalog } = useMoviesCatalog();
  const [linking, setLinking] = useState(false);
  const [extraMovies, setExtraMovies] = useState({ key: '', movies: [] });
  const authenticated = useSyncExternalStore(subscribeToAuthSession, isAuthenticated);

  useEffect(() => {
    ensureFullCatalog();
  }, [ensureFullCatalog]);

  const byId = new Map(allMovies.map((movie) => [Number(movie.id), movie]));
  const missingKey = wishlistIds.filter((id) => !byId.has(id)).join(',');
  useEffect(() => {
    if (wishlistLoading || !missingKey) return undefined;
    let active = true;
    Promise.allSettled(missingKey.split(',').map(fetchMovieById)).then((results) => {
      if (!active) return;
      const movies = results.flatMap((result) => result.status === 'fulfilled' && result.value ? [result.value] : []);
      setExtraMovies({ key: missingKey, movies });
    });
    return () => { active = false; };
  }, [missingKey, wishlistLoading]);

  for (const movie of extraMovies.key === missingKey ? extraMovies.movies : []) {
    byId.set(Number(movie.id), movie);
  }
  const wishlistMovies = wishlistIds.map((id) => byId.get(id)).filter(Boolean);
  const isEmpty = wishlistMovies.length === 0;
  const accountAction = usesMoviySession && (!authenticated || moviyLinked === false) && (
    <button className="wishlist-empty-btn wishlist-account-action" type="button" onClick={() => {
      if (authenticated) setLinking(true);
      else sendMoviyMessage({ type: 'kino-olami:login-required' });
    }}>
      {authenticated ? t('wishlist.linkAccount', 'Kino Olami hisobini bog‘lash') : t('auth.login')}
    </button>
  );
  const linkModal = linking && authenticated && (
    <SiginModal linkAccount onClose={() => setLinking(false)} onSuccess={() => {
      setLinking(false);
      sendMoviyMessage({ type: 'kino-olami:linked' });
    }} />
  );

  if (wishlistLoading || (missingKey && extraMovies.key !== missingKey)) {
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
        {linkModal}
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
          {accountAction}
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {linkModal}
      {accountAction}
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
