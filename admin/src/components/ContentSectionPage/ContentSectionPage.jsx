import { useCallback, useEffect, useState } from 'react';
import { fetchRecentItems } from '../../services/recentItemsApi';
import { deleteRecentItem, updateRecentItem } from '../../services/recentItemCrudApi';
import RecentItemsList from '../RecentItems/RecentItemsList';
import ElementAddModal from '../ElementAddModal/ElementAddModal';
import MovieForm from '../MovieForm/MovieForm';
import ActorForm from '../ActorForm/ActorForm';
import BannerForm from '../BannerForm/BannerForm';
import AdsForm from '../AdsForm/AdsForm';
import GenreForm from '../GenreForm/GenreForm';
import TrillerForm from '../TrillerForm/TrillerForm';
import '../RecentItems/RecentItemsSection.css';
import './ContentSectionPage.css';

const TITLE_MAP = {
  movies: 'Kinolar',
  actors: 'Aktyorlar',
  trillers: 'Trillerlar',
  banners: 'Bannerlar',
  ads: 'Reklamalar',
  genres: 'Janrlar',
};

export default function ContentSectionPage({ section = 'movies' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchRecentItems();
      setItems(rows?.[section] || []);
    } catch (e) {
      setError(e.message || "Ma'lumotlar yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onDelete = async (item) => {
    setBusy(true);
    setError('');
    try {
      await deleteRecentItem(section, item);
      await loadData();
    } catch (e) {
      setError(e.message || "O'chirishda xatolik.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="content-section-page">
      <h2 className="content-section-page__title">{TITLE_MAP[section] || 'Tarkiblar'}</h2>
      {error ? <p className="content-section-page__error">{error}</p> : null}
      <RecentItemsList
        items={items}
        loading={loading || busy}
        onEdit={(item) => setEditItem(item)}
        onDelete={(item) => setDeleteItem(item)}
      />

      <ElementAddModal
        isOpen={Boolean(editItem)}
        title="Elementni tahrirlash"
        onClose={() => setEditItem(null)}
      >
        {editItem && section === 'movies' ? (
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
        ) : editItem && section === 'actors' ? (
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
        ) : editItem && section === 'trillers' ? (
          <TrillerForm
            mode="edit"
            initialData={editItem.raw}
            onCancel={() => setEditItem(null)}
            onSubmitData={(payload) => updateRecentItem('trillers', editItem, payload)}
            onSaved={async () => {
              setEditItem(null);
              await loadData();
            }}
          />
        ) : editItem && section === 'banners' ? (
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
        ) : editItem && section === 'ads' ? (
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
        ) : editItem && section === 'genres' ? (
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
