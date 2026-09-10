import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { uploadToR2, UPLOAD_FOLDERS } from '../../api/uploadApi';
import './ProfileEditModal.css';

const ProfileEditModal = ({ profile, onSave, onClose }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [name, setName] = useState(profile.name || '');
  const [surname, setSurname] = useState(profile.surname || '');
  const [avatar, setAvatar] = useState(profile.avatar || null);
  const [uploading, setUploading] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const fileInputRef = useRef(null);

  const isNameInvalid = !name.trim();
  const isSurnameInvalid = !surname.trim();
  const isFormValid = !isNameInvalid && !isSurnameInvalid;

  useEffect(() => {
    setName(profile.name || '');
    setSurname(profile.surname || '');
    setAvatar(profile.avatar || null);
  }, [profile]);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (window.innerWidth > 768) return;
    const y = e.touches[0].clientY;
    const diff = y - startYRef.current;
    if (diff > 0) setDragY(diff);
  };

  const handleTouchEnd = () => {
    if (dragY > 80) onClose();
    setDragY(0);
  };

  const handleAvatarEdit = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const { url } = await uploadToR2(file, UPLOAD_FOLDERS.avatarsUsers);
      setAvatar(url);
    } catch (error) {
      showToast(error?.message || t('toast.profileAvatarRequired'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    if (uploading) return;
    setAvatar(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid || uploading) return;
    if (!avatar) {
      showToast(t('toast.profileAvatarRequired'), 'error');
      return;
    }
    onSave({ name, surname, avatar });
  };

  return (
    <>
      <div className="profile-edit-overlay" onClick={onClose} />
      <div
        className={`profile-edit-modal ${dragY > 0 ? 'profile-edit-modal-dragging' : ''}`}
        style={{ '--drag-y': `${dragY}px` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="profile-edit-drag-handle" />
        <div className="profile-edit-header">
          <h3 className="profile-edit-title">{t('profile.editProfile')}</h3>
          <button
            className="profile-edit-close profile-edit-close-desktop"
            onClick={onClose}
            aria-label={t('detail.close')}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="profile-edit-avatar-section">
            <div className="profile-edit-avatar-preview">
              {avatar ? (
                <img src={avatar} alt="" className="profile-edit-avatar-img" />
              ) : (
                <svg
                  className="profile-edit-avatar-icon"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="profile-edit-avatar-input"
              disabled={uploading}
            />
            <div className="profile-edit-avatar-actions">
              <button
                type="button"
                className="profile-edit-avatar-btn profile-edit-avatar-btn-edit"
                onClick={handleAvatarEdit}
                disabled={uploading}
              >
                {uploading ? (
                  '...'
                ) : (
                  <>
                    <svg
                      className="profile-edit-avatar-btn-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{t('profile.avatarImage')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="profile-edit-avatar-btn profile-edit-avatar-btn-delete"
                onClick={handleAvatarRemove}
                disabled={uploading}
                aria-label={t('profile.avatarDelete')}
              >
                <svg
                  className="profile-edit-avatar-btn-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
          <div className="profile-edit-field">
            <label htmlFor="profile-name">{t('profile.name')}</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
              className={`profile-edit-input ${isNameInvalid ? 'profile-edit-input-invalid' : ''}`}
            />
          </div>
          <div className="profile-edit-field">
            <label htmlFor="profile-surname">{t('profile.surname')}</label>
            <input
              id="profile-surname"
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder={t('profile.surnamePlaceholder')}
              className={`profile-edit-input ${isSurnameInvalid ? 'profile-edit-input-invalid' : ''}`}
            />
          </div>
          <button
            type="submit"
            className="profile-edit-save"
            disabled={!isFormValid || uploading}
          >
            {uploading ? '...' : t('profile.save')}
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfileEditModal;
