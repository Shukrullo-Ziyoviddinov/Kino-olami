import { useEffect, useMemo, useState } from 'react';
import { fetchRecentItems } from '../../services/recentItemsApi';
import { deleteRecentItem, updateRecentItem } from '../../services/recentItemCrudApi';
import RecentItemsTabs from './RecentItemsTabs';
import RecentItemsList from './RecentItemsList';
import ElementAddModal from '../ElementAddModal/ElementAddModal';
import MovieForm from '../MovieForm/MovieForm';
import ActorForm from '../ActorForm/ActorForm';
import BannerForm from '../BannerForm/BannerForm';
import AdsForm from '../AdsForm/AdsForm';
import GenreForm from '../GenreForm/GenreForm';
import './RecentItemsSection.css';

export default function RecentItemsSection() {
  const [activeTab, setActiveTab] = useState('movies');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState({
    movies: [],
    actors: [],
    banners: [],
    ads: [],
    genres: [],
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchRecentItems();
      setData(rows);
    } catch (e) {
      setError(e.message || 'Tarkiblar yuklanmadi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeItems = useMemo(() => data[activeTab] || [], [data, activeTab]);

  const onDelete = async (item) => {
    setBusy(true);
    setError('');
    try {
      await deleteRecentItem(activeTab, item);
      await loadData();
    } catch (e) {
      setError(e.message || "O'chirishda xatolik.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="recent-items">
      <h2 className="recent-items__title">Tarkiblar</h2>
      <RecentItemsTabs activeTab={activeTab} onChange={setActiveTab} />
      {error ? <p className="recent-items__error">{error}</p> : null}
      <RecentItemsList
        items={activeItems}
        loading={loading || busy}
        onEdit={(item) => setEditItem(item)}
        onDelete={(item) => setDeleteItem(item)}
      />

      <ElementAddModal
        isOpen={Boolean(editItem)}
        title="Elementni tahrirlash"
        onClose={() => setEditItem(null)}
      >
        {editItem && activeTab === 'movies' ? (
          <MovieForm
            mode="edit"
            initialData={editItem.raw}
            onCancel={() => setEditItem(null)}
            onSubmitData={(payload) => updateRecentItem('movies', editItem, payload)}
            onSaved={async () => {
              setEditItem(null);
              await loadData();
            }}
          />
        ) : editItem && activeTab === 'actors' ? (
          <ActorForm
            mode="edit"
            initialData={editItem.raw}
            onCancel={() => setEditItem(null)}
            onSubmitData={(payload) => updateRecentItem('actors', editItem, payload)}
            onSaved={async () => {
              setEditItem(null);
              await loadData();
            }}
          />
        ) : editItem && activeTab === 'banners' ? (
          <BannerForm
            mode="edit"
            initialData={editItem.raw}
            onCancel={() => setEditItem(null)}
            onSubmitData={(payload) => updateRecentItem('banners', editItem, payload)}
            onSaved={async () => {
              setEditItem(null);
              await loadData();
            }}
          />
        ) : editItem && activeTab === 'ads' ? (
          <AdsForm
            mode="edit"
            initialData={editItem.raw}
            onCancel={() => setEditItem(null)}
            onSubmitData={(payload) => updateRecentItem('ads', editItem, payload)}
            onSaved={async () => {
              setEditItem(null);
              await loadData();
            }}
          />
        ) : editItem && activeTab === 'genres' ? (
          <GenreForm
            mode="edit"
            initialData={editItem.raw}
            onCancel={() => setEditItem(null)}
            onSubmitData={(payload) => updateRecentItem('genres', editItem, payload)}
            onSaved={async () => {
              setEditItem(null);
              await loadData();
            }}
          />
        ) : null}
      </ElementAddModal>

      <ElementAddModal
        isOpen={Boolean(deleteItem)}
        title="Tasdiqlash"
        onClose={() => setDeleteItem(null)}
      >
        {deleteItem ? (
          <div className="recent-items__confirm">
            <p className="recent-items__confirm-text">Chindan ham o'chirmoqchimisiz?</p>
            <div className="recent-items__confirm-actions">
              <button
                type="button"
                className="recent-items__confirm-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                className="recent-items__confirm-delete"
                onClick={async () => {
                  const target = deleteItem;
                  setDeleteItem(null);
                  await onDelete(target);
                }}
              >
                O'chirish
              </button>
            </div>
          </div>
        ) : null}
      </ElementAddModal>
    </section>
  );
}
