import './Navbar.css';

function MenuIcon() {
  return (
    <svg className="navbar__menu-icon" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

export default function Navbar({
  firstName = 'Admin',
  lastName = 'Foydalanuvchi',
  avatarSrc,
  onMenuClick,
  mobileMenuOpen = false,
}) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <header className="navbar">
      <button
        type="button"
        className="navbar__menu-btn"
        aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
        aria-expanded={mobileMenuOpen}
        aria-controls="admin-sidebar"
        onClick={() => onMenuClick?.()}
      >
        <MenuIcon />
      </button>
      <div className="navbar__spacer" aria-hidden />
      <div className="navbar__profile">
        {avatarSrc ? (
          <img className="navbar__avatar" src={avatarSrc} alt="" />
        ) : (
          <div className="navbar__avatar navbar__avatar--placeholder" aria-hidden>
            {initials || 'A'}
          </div>
        )}
        <div className="navbar__names">
          <span className="navbar__first-name">{firstName}</span>
          <span className="navbar__last-name">{lastName}</span>
        </div>
      </div>
    </header>
  );
}
