const USEFUL_LINKS = [
  {
    id: 'statistics',
    label: 'Statistika',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
        />
      </svg>
    ),
  },
];

/**
 * Foydali bo‘lim (keyin router / sahifalar ulanadi).
 */
export default function SidebarFoydali({ onCloseMobile, activeNav = "dashboard", onNavigate }) {
  return (
    <>
      {USEFUL_LINKS.map((item) => (
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
