const SETTINGS_LINKS = [
  {
    id: 'social',
    label: 'Ijtimoiy tarmoqlar',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
        />
      </svg>
    ),
  },
  {
    id: 'app-links',
    label: 'Ilova linklari',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
        />
      </svg>
    ),
  },
  {
    id: 'language',
    label: "Til sozlamalari",
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H9v2H2v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.58 5.58L4 17.91l6-6.01 1.44 1.44 1.43-1.43zm5.13-9.07H20v2h-2v10h-2V8h-2V6z"
        />
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Aloqa',
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.21z"
        />
      </svg>
    ),
  },
  {
    id: "subscription",
    label: "Kanallarga obuna",
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M21 6.5a2.5 2.5 0 0 0-2.5-2.5h-13A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5v-11zM6 8h12v2H6V8zm0 4h7v2H6v-2z"
        />
      </svg>
    ),
  },
  {
    id: "bot-broadcast",
    label: "Botga reklama yuborish",
    icon: (
      <svg className="sidebar__nav-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M2 21l20-9L2 3v7l14 2-14 2v7z"
        />
      </svg>
    ),
  },
];

/**
 * Sozlamalar bo‘limi (keyin router / sahifalar ulanadi).
 */
export default function SidebarSettings({ onCloseMobile, onSettingsClick }) {
  return (
    <>
      {SETTINGS_LINKS.map((item) => (
        <button
          key={item.id}
          type="button"
          className="sidebar__nav-btn"
          onClick={() => {
            onSettingsClick?.(item.id);
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
