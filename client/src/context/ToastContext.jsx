import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ToastContainer from '../components/Toast/ToastContainer';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'error', duration = 3000) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
};
