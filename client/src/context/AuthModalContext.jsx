import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiginModal from '../components/SiginModal/SiginModal';
import { sendMoviyMessage, usesMoviySession } from '../utils/moviyBridge';

const AuthModalContext = createContext(null);

export const AuthModalProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authModalState, setAuthModalState] = useState({
    open: false,
    redirectToProfile: false,
  });

  const openAuthModal = ({ redirectToProfile = false } = {}) => {
    if (usesMoviySession) {
      sendMoviyMessage({ type: 'kino-olami:login-required' });
      return;
    }
    setAuthModalState({ open: true, redirectToProfile });
  };

  const closeAuthModal = () => {
    setAuthModalState((prev) => ({ ...prev, open: false }));
  };

  const handleAuthSuccess = () => {
    const shouldRedirect = authModalState.redirectToProfile;
    closeAuthModal();
    if (shouldRedirect) {
      navigate('/profile');
    }
  };

  const value = { openAuthModal, closeAuthModal };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {authModalState.open && (
        <SiginModal
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return ctx;
};
