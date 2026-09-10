import React from 'react';
import { useTranslation } from 'react-i18next';
import './ProfileLogoutModal.css';

const ProfileLogoutModal = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="profile-logout-overlay" onClick={onClose} />
      <div className="profile-logout-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="profile-logout-heading">{t('profile.logoutModalHeading')}</h3>
        <h4 className="profile-logout-title">{t('profile.logoutModalTitle')}</h4>
        <p className="profile-logout-text">{t('profile.logoutModalDescription')}</p>

        <div className="profile-logout-actions">
          <button type="button" className="profile-logout-btn profile-logout-btn-no" onClick={onClose}>
            {t('profile.no')}
          </button>
          <button type="button" className="profile-logout-btn profile-logout-btn-yes" onClick={onConfirm}>
            {t('profile.yes')}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileLogoutModal;
