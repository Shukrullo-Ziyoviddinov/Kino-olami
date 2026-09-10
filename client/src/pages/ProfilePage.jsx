import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ProfileEditModal from '../components/Profile/ProfileEditModal';
import ProfileAvatar from '../components/Profile/ProfileAvatar';
import LoaderSkeleton from '../components/LoaderSkeleton/LoaderSkeleton';
import ProfileLanguageModal from '../components/Profile/ProfileLanguageModal';
import ProfileContactModal from '../components/Profile/ProfileContactModal';
import ProfileSocialModal from '../components/Profile/ProfileSocialModal';
import ProfileLogoutModal from '../components/Profile/ProfileLogoutModal';
import { fetchSocialLinks } from '../api/socialLinksApi';
import { logoutUser } from '../api/authApi';
import { fetchUserProfile, updateUserProfile } from '../api/userApi';
import { useToast } from '../context/ToastContext';
import { PROFILE_STORAGE_KEY, clearAuthSession, getAuthToken } from '../utils/authStorage';
import './ProfilePage.css';

const DEFAULT_PROFILE = { name: 'Shukrullo', surname: 'Aliyov', phone: '909560304', avatar: null };

const getStoredProfile = () => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        name: parsed.name?.trim() || DEFAULT_PROFILE.name,
        surname: parsed.surname?.trim() || DEFAULT_PROFILE.surname,
        phone: parsed.phone?.trim() || DEFAULT_PROFILE.phone,
        avatar: parsed.avatar ?? null,
      };
    }
  } catch (e) {}
  return { ...DEFAULT_PROFILE };
};

const getCurrentLanguage = () => {
  const lang = (typeof window !== 'undefined' && localStorage.getItem('i18nextLng')) || 'uz';
  const code = typeof lang === 'string' ? lang.toLowerCase().split('-')[0] : 'uz';
  return code === 'uz' || code === 'ru' ? code : 'uz';
};

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getStoredProfile);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage);
  const [socialData, setSocialData] = useState({
    contact: {},
    social: {},
    appStore: {},
  });
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
  }, [i18n.language]);

  useEffect(() => {
    let isMounted = true;

    const loadSocialData = async () => {
      try {
        if (isMounted) setProfileLoading(true);
        const data = await fetchSocialLinks();
        if (isMounted) setSocialData(data);
      } catch (_error) {
        if (isMounted) {
          setSocialData({ contact: {}, social: {}, appStore: {} });
        }
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    loadSocialData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!getAuthToken()) return;
      try {
        const data = await fetchUserProfile();
        if (!isMounted || !data) return;
        const nextProfile = {
          name: data.firstName?.trim() || DEFAULT_PROFILE.name,
          surname: data.lastName?.trim() || DEFAULT_PROFILE.surname,
          phone: data.phone?.trim() || DEFAULT_PROFILE.phone,
          avatar: data.avatar ?? null,
        };
        setProfile(nextProfile);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
      } catch (_error) {}
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (data) => {
    if (!data.avatar) {
      showToast(t('toast.profileAvatarRequired'), 'error');
      return;
    }

    try {
      const serverProfile = await updateUserProfile({
        firstName: data.name?.trim(),
        lastName: data.surname?.trim(),
        avatar: data.avatar,
      });

      const newProfile = {
        name: serverProfile?.firstName?.trim() || data.name?.trim() || profile.name,
        surname: serverProfile?.lastName?.trim() || data.surname?.trim() || profile.surname,
        phone: serverProfile?.phone?.trim() || profile.phone,
        avatar: serverProfile?.avatar ?? data.avatar ?? null,
      };

      setProfile(newProfile);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      setShowEditModal(false);
    } catch (error) {
      showToast(error?.message || t('auth.errorFallback'), 'error');
    }
  };

  const handleLanguageChange = (langCode) => {
    if (langCode === 'uz' || langCode === 'ru') {
      i18n.changeLanguage(langCode);
      localStorage.setItem('i18nextLng', langCode);
      setCurrentLanguage(langCode);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      await logoutUser();
    } catch (_error) {
      // Logout should still continue locally even if backend request fails.
    } finally {
      clearAuthSession();
      setShowLogoutModal(false);
      navigate('/');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <div className="profile-page-bg" />
        <div className="profile-page-content">
          <div className="profile-page-top">
            {profileLoading ? (
              <LoaderSkeleton variant="profile-top" className="profile-page-top-skeleton" />
            ) : (
            <>
            <ProfileAvatar src={profile.avatar} ariaLabel={t('profile.uploadPhoto')} />
            <div className="profile-info">
              <div className="profile-name">
                {t('profile.name')}: {profile.name || t('profile.name')}
              </div>
              <div className="profile-secondary">
                <div>{t('profile.surname')}: {profile.surname || t('profile.surname')}</div>
                <div>{t('profile.phone')}: {profile.phone || t('profile.phone')}</div>
              </div>
            </div>
            <button
              className="profile-edit-btn"
              onClick={() => setShowEditModal(true)}
              aria-label={t('profile.edit')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            </>
            )}
          </div>

          {profileLoading ? (
            <LoaderSkeleton variant="wishlist-block" className="profile-wishlist-block profile-wishlist-block-skeleton" />
          ) : (
          <>
          <button
            className="profile-wishlist-block"
            onClick={() => navigate('/wishlist')}
          >
            <div className="profile-wishlist-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{t('navbar.favorites')}</span>
            </div>
            <svg className="profile-wishlist-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="profile-wishlist-block"
            onClick={() => setShowLangModal(true)}
          >
            <div className="profile-wishlist-left">
              <img
                src={currentLanguage === 'uz' ? '/img/uzb-by.jpg' : '/img/rubay.png'}
                alt=""
                className="profile-wishlist-flag"
              />
              <span>{t('profile.appLanguage')}</span>
            </div>
            <svg className="profile-wishlist-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="profile-wishlist-block"
            onClick={() => setShowContactModal(true)}
          >
            <div className="profile-wishlist-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{t('profile.contactUs')}</span>
            </div>
            <svg className="profile-wishlist-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="profile-wishlist-block"
            onClick={() => setShowSocialModal(true)}
          >
            <div className="profile-wishlist-left">
              <svg
                className="profile-wishlist-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{t('profile.socialNetworks')}</span>
            </div>
            <svg className="profile-wishlist-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="profile-wishlist-block profile-logout-block"
            onClick={() => setShowLogoutModal(true)}
          >
            <div className="profile-wishlist-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{t('profile.logout')}</span>
            </div>
            <svg className="profile-wishlist-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          </>
          )}
          <div className="profile-app-stores">
            {profileLoading ? (
              <>
                <LoaderSkeleton variant="app-store-img" className="profile-app-store-skeleton" width={140} height={44} />
                <LoaderSkeleton variant="app-store-img" className="profile-app-store-skeleton" width={140} height={44} />
              </>
            ) : (
            <>
            {socialData.appStore?.android?.link && (
              <a
                href={socialData.appStore.android.link}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-app-store-link"
              >
                <img src={socialData.appStore.android.icon} alt="Google Play" className="profile-app-store-img" />
              </a>
            )}
            {socialData.appStore?.ios?.link && (
              <a
                href={socialData.appStore.ios.link}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-app-store-link"
              >
                <img src={socialData.appStore.ios.icon} alt="App Store" className="profile-app-store-img" />
              </a>
            )}
            </>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <ProfileEditModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showLangModal && (
        <ProfileLanguageModal
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          onClose={() => setShowLangModal(false)}
        />
      )}

      {showContactModal && (
        <ProfileContactModal
          onClose={() => setShowContactModal(false)}
          contactData={socialData.contact}
        />
      )}

      {showSocialModal && (
        <ProfileSocialModal
          onClose={() => setShowSocialModal(false)}
          socialLinks={socialData.social}
        />
      )}

      {showLogoutModal && (
        <ProfileLogoutModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleConfirmLogout}
        />
      )}
    </div>
  );
};

export default ProfilePage;
