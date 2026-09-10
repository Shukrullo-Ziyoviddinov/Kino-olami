import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import './AdminLayout.css';

const MOBILE_MQ = '(max-width: 767px)';

function subscribeMobile(cb) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getMobileServerSnapshot() {
  return false;
}

export default function AdminLayout({
  children,
  profile,
  onSettingsClick,
  activeNav = 'dashboard',
  onMainNavigate,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      if (!mq.matches) {
        setMobileMenuOpen(false);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  return (
    <div className="admin-layout">
      {mobileMenuOpen && isMobile && (
        <button
          type="button"
          className="admin-layout__backdrop"
          aria-label="Menyuni yopish"
          onClick={closeMobileMenu}
        />
      )}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={closeMobileMenu}
        ariaHiddenOverlay={isMobile && !mobileMenuOpen}
        onSettingsClick={onSettingsClick}
        activeNav={activeNav}
        onMainNavigate={onMainNavigate}
        onLogout={onLogout}
      />
      <div className="admin-layout__column">
        <Navbar
          firstName={profile?.firstName}
          lastName={profile?.lastName}
          avatarSrc={profile?.avatarSrc}
          onMenuClick={toggleMobileMenu}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className="admin-layout__main">{children}</main>
      </div>
    </div>
  );
}
