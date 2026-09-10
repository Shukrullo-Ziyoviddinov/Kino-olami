import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import NavbarMobile from './components/Navbar/NavbarMobile';
import Home from './pages/Home';
import RecommendedPage from './pages/RecommendedPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import ActorsPage from './pages/ActorsPage';
import NewsPage from './pages/NewsPage';
import MovieDetail from './components/MovieDetail/MovieDetail';
import { WishlistProvider } from './context/WishlistContext';
import { ViewedMoviesProvider } from './context/ViewedMoviesContext';
import { ContentLanguageProvider } from './context/ContentLanguageContext';
import { LoadingProvider } from './context/LoadingContext';
import { MoviesCatalogProvider } from './context/MoviesCatalogContext';
import { ToastProvider } from './context/ToastContext';
import { AuthModalProvider } from './context/AuthModalContext';
import TelegramBackButton from './components/TelegramBackButton/TelegramBackButton';
import './App.css';

function App() {
  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    if (!tg) {
      return;
    }
    const isTelegramClient =
      /Telegram/i.test(window.navigator?.userAgent || '') ||
      Boolean(tg.initData);

    if (!isTelegramClient) {
      return;
    }

    const requestTelegramFullscreen = () => {
      tg.expand();
      const canRequestFullscreen =
        typeof tg.requestFullscreen === 'function' &&
        (typeof tg.isVersionAtLeast !== 'function' || tg.isVersionAtLeast('8.0'));

      if (canRequestFullscreen) {
        try {
          tg.requestFullscreen();
        } catch (error) {
          // Telegram can throw on some clients despite exposing the method.
        }
      }
    };

    const handleViewportChanged = () => {
      tg.expand();
    };

    tg.ready();
    requestTelegramFullscreen();
    if (typeof tg.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes();
    }
    if (typeof tg.setHeaderColor === 'function') {
      tg.setHeaderColor('#0b0b0f');
    }
    if (typeof tg.setBackgroundColor === 'function') {
      tg.setBackgroundColor('#0b0b0f');
    }
    if (typeof tg.onEvent === 'function') {
      tg.onEvent('viewportChanged', handleViewportChanged);
    }
    window.addEventListener('click', requestTelegramFullscreen, { once: true });
    window.addEventListener('touchstart', requestTelegramFullscreen, { once: true });

    return () => {
      if (typeof tg.offEvent === 'function') {
        tg.offEvent('viewportChanged', handleViewportChanged);
      }
      window.removeEventListener('click', requestTelegramFullscreen);
      window.removeEventListener('touchstart', requestTelegramFullscreen);
    };
  }, []);

  return (
    <Router>
      <ToastProvider>
        <AuthModalProvider>
          <ContentLanguageProvider>
          <LoadingProvider>
          <MoviesCatalogProvider>
          <WishlistProvider>
          <ViewedMoviesProvider>
          <div className="App">
            <TelegramBackButton />
            <Navbar />
            <main className="App-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:categoryId" element={<RecommendedPage />} />
                <Route path="/similar-movies/:movieId" element={<RecommendedPage />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/recommended" element={<RecommendedPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/actor/:id" element={<ActorsPage />} />
                <Route path="/news" element={<NewsPage />} />
              </Routes>
            </main>
            <NavbarMobile />
          </div>
          </ViewedMoviesProvider>
          </WishlistProvider>
          </MoviesCatalogProvider>
          </LoadingProvider>
          </ContentLanguageProvider>
        </AuthModalProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
