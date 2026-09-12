import ScrollTouch from '../ScrollTouch/ScrollTouch';
import './QuickActions.css';

function PlusIcon() {
  return (
    <svg className="quick-actions__plus-svg" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

const ACTIONS = [
  { id: 'movie', label: "Kino qo'shish" },
  { id: 'actor', label: "Aktyor qo'shish" },
  { id: 'banner', label: "Banner qo'shish" },
  { id: 'ad', label: "Reklama qo'shish" },
  { id: 'genre', label: "Janr qo'shish" },
];

export default function QuickActions({ onActionClick }) {
  return (
    <section className="quick-actions" aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title" className="quick-actions__title">
        Tezkor amallar
      </h2>
      <ScrollTouch className="quick-actions__grid" role="list" allowInteractiveDrag>
        {ACTIONS.map((item) => (
          <div key={item.id} className="quick-actions__cell" role="listitem">
            <button
              type="button"
              className="quick-actions__card"
              onClick={() => {
                onActionClick?.(item.id);
              }}
            >
              <span className="quick-actions__icon" aria-hidden>
                <PlusIcon />
              </span>
              <span className="quick-actions__label">{item.label}</span>
            </button>
          </div>
        ))}
      </ScrollTouch>
    </section>
  );
}
