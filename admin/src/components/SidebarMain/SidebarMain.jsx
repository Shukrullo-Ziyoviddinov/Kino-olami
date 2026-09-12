const NAV_LINKS = [
  {
    id: 'movies',
    label: 'Kinolar',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-4zm0 3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-6 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S10 9.83 10 9s.67-1.5 1.5-1.5zm-6 0c.83 0 1.5.67 1.5 1.5S7.83 12 7 12s-1.5-.67-1.5-1.5S6.17 9 7 9zm12 7.5c-2.21 0-4-1.79-4-4H7c0 2.21-1.79 4-4 4v2h16v-2h-3z"
        />
      </svg>
    ),
  },
  {
    id: 'actors',
    label: 'Aktyorlar',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
        />
      </svg>
    ),
  },
  {
    id: 'banners',
    label: 'Bannerlar',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 15h1.75l1.75-2.25L11.5 15H13l-2.25-3L13 9h-1.5l-1.75 2.25L8.5 9H7l2.25 3L8 15zm8.5-4.5h-3v1h3v-1zM19 13h-3v1h3v-1z"
        />
      </svg>
    ),
  },
  {
    id: 'ads',
    label: 'Reklamalar',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.39 3 2.39V23h3v-2h-2v-2.52c-.83-.52-2-1.04-2-1.67s.17-1.17 1-1.5V7h1V3H5v4h1v8.33c-.83.33-1 .83-1 1.5s1.17 1.15 2 1.67V22H3v2h3v-2.03c.79-1 2.05-1.68 3-2.39V20h14v-2.39zM6.39 7.61C5.04 8.99 4 10.79 4 13c0 2.21 1.04 4.01 2.39 5.39l1.06-1.06C6.23 16.39 5 14.89 5 13c0-1.89 1.23-3.39 2.45-4.33L6.39 7.61zM12 9.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 6c1.11 0 2-.89 2-2 0-1.11-.89-2-2-2-1.11 0-2 .89-2 2 0 1.11.89 2 2 2z"
        />
      </svg>
    ),
  },
  {
    id: 'genres',
    label: 'Janrlar',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z"
        />
      </svg>
    ),
  },
];

/**
 * Asosiy bo‘lim navigatsiyasi (keyin router / sahifalar ulanadi).
 */
export default function SidebarMain({ onCloseMobile, activeNav = 'dashboard', onNavigate }) {
  return (
    <>
      {NAV_LINKS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`sidebar__nav-btn${activeNav === item.id ? ' sidebar__nav-btn--active' : ''}`}
          onClick={() => {
            onNavigate?.(item.id);
            onCloseMobile?.();
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </>
  );
}
