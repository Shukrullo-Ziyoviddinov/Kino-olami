import { useState } from 'react';
import { adminLogin } from '../../services/adminAuthApi';
import './AdminAuthModal.css';

export default function AdminAuthModal({ onSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !password) {
      setError("Ism, familiya va parolni to'ldiring.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await adminLogin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      onSuccess?.({
        firstName: data.firstName,
        lastName: data.lastName,
      });
    } catch (e) {
      setError(e?.message || "Kirishda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-modal" role="dialog" aria-modal="true" aria-label="Admin login">
      <div className="admin-auth-modal__panel">
        <h1 className="admin-auth-modal__title">Admin panelga kirish</h1>
        <label className="admin-auth-modal__label" htmlFor="admin-first-name">
          Ism
        </label>
        <input
          id="admin-first-name"
          className="admin-auth-modal__input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <label className="admin-auth-modal__label" htmlFor="admin-last-name">
          Familiya
        </label>
        <input
          id="admin-last-name"
          className="admin-auth-modal__input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <label className="admin-auth-modal__label" htmlFor="admin-password">
          Parol
        </label>
        <div className="admin-auth-modal__password-wrap">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            className="admin-auth-modal__input admin-auth-modal__input--password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit();
            }}
          />
          <button
            type="button"
            className="admin-auth-modal__eye-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M2.1 3.51L.69 4.92l3.02 3.02C2.35 9.2 1.32 10.54.5 12c2 3.58 5.76 6 10.5 6 1.96 0 3.72-.41 5.26-1.13l3.31 3.31 1.41-1.41L2.1 3.51zM7.53 11.76l1.56 1.56c-.06-.2-.09-.42-.09-.64a3 3 0 013-3c.22 0 .44.03.64.09l1.56 1.56A3.47 3.47 0 0115 12a3.5 3.5 0 01-5.71 2.71l-1.76-1.76zM12 6c4.74 0 8.5 2.42 10.5 6-.67 1.2-1.5 2.25-2.47 3.1l-1.43-1.43A10.72 10.72 0 0020.64 12c-1.73-2.61-4.83-4-8.64-4-.91 0-1.78.08-2.6.24L7.71 6.55C9 6.2 10.45 6 12 6z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M12 5c-4.73 0-8.8 2.94-10.5 7 1.7 4.06 5.77 7 10.5 7s8.8-2.94 10.5-7c-1.7-4.06-5.77-7-10.5-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"
                />
              </svg>
            )}
          </button>
        </div>
        {error ? <p className="admin-auth-modal__error">{error}</p> : null}
        <button
          type="button"
          className="admin-auth-modal__submit"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? 'Kutilmoqda…' : 'Kirish'}
        </button>
      </div>
    </div>
  );
}
