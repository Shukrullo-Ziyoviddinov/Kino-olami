import { useState } from 'react';
import AdminLayout from './components/AdminLayout/AdminLayout';
import DashboardHome from './components/DashboardHome/DashboardHome';
import QuickActions from './components/QuickActions/QuickActions';
import RecentItemsSection from './components/RecentItems/RecentItemsSection';
import ElementAddModal from './components/ElementAddModal/ElementAddModal';
import BannerForm from './components/BannerForm/BannerForm';
import GenreForm from './components/GenreForm/GenreForm';
import AdsForm from './components/AdsForm/AdsForm';
import ActorForm from './components/ActorForm/ActorForm';
import MovieForm from './components/MovieForm/MovieForm';
import TrillerForm from './components/TrillerForm/TrillerForm';
import NewsForm from './components/NewsForm/NewsForm';
import SettingsLinksForm from './components/SettingsLinksForm/SettingsLinksForm';
import TranslationSettingsForm from './components/TranslationSettingsForm/TranslationSettingsForm';
import SubscriptionChannelsForm from './components/SubscriptionChannelsForm/SubscriptionChannelsForm';
import BotBroadcastForm from './components/BotBroadcastForm/BotBroadcastForm';
import ContentSectionPage from './components/ContentSectionPage/ContentSectionPage';
import AdminAuthModal from './components/AdminAuthModal/AdminAuthModal';
import Statistika from './components/Statistika/Statistika';

const SESSION_KEY = 'kinomax_admin_session';

function getInitialSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.firstName || !parsed?.lastName) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function App() {
  const [activeModal, setActiveModal] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [session, setSession] = useState(getInitialSession);

  const onActionClick = (actionId) => {
    if (
      actionId === 'banner' ||
      actionId === 'genre' ||
      actionId === 'ad' ||
      actionId === 'actor' ||
      actionId === 'movie' ||
      actionId === 'triller' ||
      actionId === 'news'
    ) {
      setActiveModal(actionId);
    }
  };

  const onSettingsClick = (settingId) => {
    if (settingId === 'social') setActiveModal('settings-social');
    if (settingId === 'app-links') setActiveModal('settings-app-links');
    if (settingId === 'language') setActiveModal('settings-language');
    if (settingId === 'contact') setActiveModal('settings-contact');
    if (settingId === 'subscription') setActiveModal('settings-subscription');
    if (settingId === 'bot-broadcast') setActiveModal('settings-bot-broadcast');
  };

  const modalTitleMap = {
    banner: "Banner qo'shish",
    genre: "Janr qo'shish",
    ad: "Reklama qo'shish",
    actor: "Aktyor qo'shish",
    movie: "Kino qo'shish",
    triller: "Triller qo'shish",
    news: "Yangilik qo'shish",
    'settings-social': 'Ijtimoiy tarmoqlar',
    'settings-app-links': 'Ilova havolalari',
    'settings-language': 'Til sozlamalari',
    'settings-contact': 'Aloqa',
    'settings-subscription': 'Kanallarga obuna',
    'settings-bot-broadcast': 'Botga reklama yuborish',
  };

  const closeModal = () => setActiveModal('');

  const onLoginSuccess = (profile) => {
    setSession(profile);
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  };

  const onLogout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    setActiveModal('');
    setActiveView('dashboard');
  };

  return (
    <>
      <AdminLayout
        profile={{
          firstName: session?.firstName || 'Admin',
          lastName: session?.lastName || 'Foydalanuvchi',
        }}
        onSettingsClick={onSettingsClick}
        activeNav={activeView}
        onMainNavigate={setActiveView}
        onLogout={onLogout}
      >
        {activeView === 'dashboard' ? (
          <>
            <DashboardHome />
            <QuickActions onActionClick={onActionClick} />
            <RecentItemsSection />
          </>
        ) : activeView === 'movies' ? (
          <ContentSectionPage section="movies" />
        ) : activeView === 'statistics' ? (
          <Statistika />
        ) : activeView === 'actors' ? (
          <ContentSectionPage section="actors" />
        ) : activeView === 'trillers' ? (
          <ContentSectionPage section="trillers" />
        ) : activeView === 'news' ? (
          <ContentSectionPage section="news" />
        ) : activeView === 'banners' ? (
          <ContentSectionPage section="banners" />
        ) : activeView === 'ads' ? (
          <ContentSectionPage section="ads" />
        ) : activeView === 'genres' ? (
          <ContentSectionPage section="genres" />
        ) : (
          <ContentSectionPage section="movies" />
        )}

        <ElementAddModal
          isOpen={Boolean(activeModal)}
          title={modalTitleMap[activeModal] || "Element qo'shish"}
          onClose={closeModal}
        >
          {activeModal === 'genre' ? (
            <GenreForm onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'movie' ? (
            <MovieForm onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'settings-social' ? (
            <SettingsLinksForm section="social" onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'settings-app-links' ? (
            <SettingsLinksForm section="app-links" onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'settings-language' ? (
            <TranslationSettingsForm onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'settings-contact' ? (
            <SettingsLinksForm section="contact" onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'settings-subscription' ? (
            <SubscriptionChannelsForm onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'settings-bot-broadcast' ? (
            <BotBroadcastForm onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'actor' ? (
            <ActorForm onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'triller' ? (
            <TrillerForm onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'news' ? (
            <NewsForm onCancel={closeModal} onSaved={closeModal} />
          ) : activeModal === 'ad' ? (
            <AdsForm onCancel={closeModal} onSaved={closeModal} />
          ) : (
            <BannerForm onCancel={closeModal} onSaved={closeModal} />
          )}
        </ElementAddModal>
      </AdminLayout>
      {!session ? <AdminAuthModal onSuccess={onLoginSuccess} /> : null}
    </>
  );
}

export default App;
