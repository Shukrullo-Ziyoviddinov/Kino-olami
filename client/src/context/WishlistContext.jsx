import React, { createContext, useContext, useState, useEffect } from 'react';
import { addWishlist, fetchWishlist, removeWishlist } from '../api/userApi';
import { AUTH_SESSION_CHANGED_EVENT, getAuthToken } from '../utils/authStorage';
import { useAuthModal } from './AuthModalContext';

const WishlistContext = createContext();

const toId = (movieOrId) => {
  const raw = movieOrId && typeof movieOrId === 'object' ? movieOrId.id : movieOrId;
  const id = Number.parseInt(raw, 10);
  return Number.isNaN(id) ? null : id;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState([]);
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    let isMounted = true;

    const syncWishlist = async () => {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) setWishlistIds([]);
        return;
      }

      try {
        const serverWishlist = await fetchWishlist();
        if (isMounted) setWishlistIds(serverWishlist.map((item) => toId(item)).filter((item) => item !== null));
      } catch (_error) {
        if (isMounted) setWishlistIds([]);
      }
    };

    syncWishlist();

    const handleSessionChange = () => {
      syncWishlist();
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    window.addEventListener('storage', handleSessionChange);
    return () => {
      isMounted = false;
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
      window.removeEventListener('storage', handleSessionChange);
    };
  }, []);

  const addToWishlist = async (movieOrId) => {
    const id = toId(movieOrId);
    if (id === null) return;
    const token = getAuthToken();
    if (!token) {
      openAuthModal();
      return;
    }

    let shouldRollback = false;
    setWishlistIds((prev) => {
      if (prev.includes(id)) return prev;
      shouldRollback = true;
      return [...prev, id];
    });

    try {
      await addWishlist(id);
    } catch (_error) {
      if (shouldRollback) {
        setWishlistIds((prev) => prev.filter((item) => item !== id));
      }
    }
  };

  const removeFromWishlist = async (movieOrId) => {
    const id = toId(movieOrId);
    if (id === null) return;
    const token = getAuthToken();
    if (!token) {
      openAuthModal();
      return;
    }

    let removed = false;
    setWishlistIds((prev) => {
      if (!prev.includes(id)) return prev;
      removed = true;
      return prev.filter((item) => item !== id);
    });

    try {
      await removeWishlist(id);
    } catch (_error) {
      if (removed) {
        setWishlistIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }
    }
  };

  const toggleWishlist = (movieOrId) => {
    const id = toId(movieOrId);
    if (id === null) return;
    if (wishlistIds.includes(id)) {
      removeFromWishlist(id);
      return;
    }
    addToWishlist(id);
  };

  const isInWishlist = (movieOrId) => {
    const id = toId(movieOrId);
    if (id === null) return false;
    return wishlistIds.includes(id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
};
