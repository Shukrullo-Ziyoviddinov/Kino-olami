import React from 'react';
import './Toast.css';

const ToastContainer = ({ toasts, onClose }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-root">
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-item-${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => onClose(toast.id)} aria-label="Close">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
