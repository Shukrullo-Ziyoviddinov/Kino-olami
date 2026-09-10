import SidebarMain from '../SidebarMain/SidebarMain';
import SidebarSettings from '../SidebarSettings/SidebarSettings';
import SidebarFoydali from '../SidebarFoydali/SidebarFoydali';
import SidebarLogout from '../SidebarLogout/SidebarLogout';
import './Sidebar.css';

function DashboardIcon() {
  return (
    <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
      />
    </svg>
  );
}

export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
  ariaHiddenOverlay = false,
  onSettingsClick,
  activeNav = 'dashboard',
  onMainNavigate,
  onLogout,
}) {
  return (
    <aside
      id="admin-sidebar"
      className={`sidebar${isMobileOpen ? ' sidebar--open' : ''}`}
      aria-label="Admin navigatsiya"
      aria-hidden={ariaHiddenOverlay || undefined}
    >
      <div className="sidebar__inner">
        <div className="sidebar__brand">
          <div className="sidebar__logo-wrap">
            <img
              className="sidebar__logo-mark"
              src={`${process.env.PUBLIC_URL}/img/chosontv_preview_rev_1.png`}
              alt="ChosonTV"
            />
          </div>
          <div className="sidebar__title-block">
            <span className="sidebar__title">Admin panel</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <button
            type="button"
            className={`sidebar__nav-btn${activeNav === 'dashboard' ? ' sidebar__nav-btn--active' : ''}`}
            onClick={() => {
              onMainNavigate?.('dashboard');
              onCloseMobile?.();
            }}
          >
            <DashboardIcon />
            <span>Dashboard</span>
          </button>
          <span className="sidebar__section-title">Asosiy</span>
          <SidebarMain onCloseMobile={onCloseMobile} activeNav={activeNav} onNavigate={onMainNavigate} />
          <span className="sidebar__section-title">Sozlamalar</span>
          <SidebarSettings onCloseMobile={onCloseMobile} onSettingsClick={onSettingsClick} />
          <span className="sidebar__section-title">Foydali</span>
          <SidebarFoydali
            onCloseMobile={onCloseMobile}
            activeNav={activeNav}
            onNavigate={onMainNavigate}
          />
        </nav>
        <SidebarLogout onCloseMobile={onCloseMobile} onLogout={onLogout} />
      </div>
    </aside>
  );
}
