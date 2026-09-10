
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../utils/authStorage';
import { addViewedMovie as addViewedMovieApi } from '../api/userApi';

const STORAGE_KEY = 'violet_viewed_movies';
const MAX_ITEMS = 50;

const getStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed : { items: [] };
  } catch {
    return { items: [] };
  }
};

const saveStored = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('ViewedMovies save error:', e);
  }
};

const ViewedMoviesContext = createContext(null);

export const ViewedMoviesProvider = ({ children }) => {
  const [data, setData] = useState(getStored);

  useEffect(() => {
    saveStored(data);
  }, [data]);

  const addMovie = useCallback((movie) => {
    const movieId = Number(movie?.id ?? movie?.movieId);
    if (!Number.isFinite(movieId) || movieId <= 0) return;

    const item = {
      id: movieId,
      typeCategory: movie.typeCategory || [],
      filterGenre: movie.filterGenre || [],
      filterCountry: movie.filterCountry || null
    };
    setData((prev) => {
      const filtered = prev.items.filter((i) => Number(i.id) !== movieId);
      const next = [item, ...filtered].slice(0, MAX_ITEMS);
      return { items: next };
    });

    // Weekly top / tavsiyalar uchun — faqat login user DB ga yoziladi
    if (getAuthToken()) {
      addViewedMovieApi(movieId).catch(() => {});
    }
  }, []);

  const getViewedItems = useCallback(() => data.items, [data.items]);

  return (
    <ViewedMoviesContext.Provider value={{ addMovie, getViewedItems }}>
      {children}
    </ViewedMoviesContext.Provider>
  );
};

export const useViewedMovies = () => {
  const ctx = useContext(ViewedMoviesContext);
  if (!ctx) throw new Error('useViewedMovies must be used within ViewedMoviesProvider');
  return ctx;
};
