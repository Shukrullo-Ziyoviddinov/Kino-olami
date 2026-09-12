import ScrollTouch from '../ScrollTouch/ScrollTouch';

const TABS = [
  { id: 'movies', label: 'Kinolar' },
  { id: 'actors', label: 'Aktyorlar' },
  { id: 'banners', label: 'Bannerlar' },
  { id: 'ads', label: 'Reklama' },
  { id: 'genres', label: 'Janrlar' },
];

export default function RecentItemsTabs({ activeTab, onChange }) {
  return (
    <ScrollTouch className="recent-items__tabs" role="tablist" aria-label="Tarkiblar kategoriyalari" allowInteractiveDrag>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`recent-items__tab${activeTab === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </ScrollTouch>
  );
}
