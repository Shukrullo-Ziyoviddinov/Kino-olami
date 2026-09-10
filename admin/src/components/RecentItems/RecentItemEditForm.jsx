import { useMemo, useState } from 'react';
import { updateRecentItem } from '../../services/recentItemCrudApi';

export default function RecentItemEditForm({ section, item, onCancel, onSaved }) {
  const raw = item?.raw || {};
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => ({
    titleUz: item?.title || '',
    titleRu: item?.subtitle || '',
    image: item?.image || '',
    sortOrder: String(raw?.sortOrder || 1),
    movieId: String(raw?.movieId || ''),
    videoUrl: String(raw?.videoUrl || ''),
    filterGenre: Array.isArray(raw?.filterGenre) ? raw.filterGenre.join(', ') : '',
  }));

  const hint = useMemo(() => {
    if (section === 'movies') return "Kino title va posterni tahrirlash";
    if (section === 'actors') return "Aktyor ismi va rasmini tahrirlash";
    if (section === 'banners') return "Banner movieId, rasm va sort tartibini tahrirlash";
    if (section === 'ads') return "Reklama video URL va sort tartibini tahrirlash";
    if (section === 'genres') return "Janr nomi, rasmi va filter janrni tahrirlash";
    return '';
  }, [section]);

  const onSave = async () => {
    setSaving(true);
    setError('');
    try {
      let payload = {};
      if (section === 'movies') {
        payload = {
          title: { ...(raw?.title || {}), uz: form.titleUz, ru: form.titleRu },
          homeImg: { ...(raw?.homeImg || {}), uz: form.image, ru: form.image },
        };
      } else if (section === 'actors') {
        payload = {
          name: { ...(raw?.name || {}), uz: form.titleUz, ru: form.titleRu },
          image: form.image,
        };
      } else if (section === 'banners') {
        payload = {
          movieId: Number(form.movieId) || Number(raw?.movieId || 0),
          image: form.image,
          sortOrder: Number(form.sortOrder) || 1,
        };
      } else if (section === 'ads') {
        payload = {
          videoUrl: form.videoUrl,
          sortOrder: Number(form.sortOrder) || 1,
        };
      } else if (section === 'genres') {
        payload = {
          title: { ...(raw?.title || {}), uz: form.titleUz, ru: form.titleRu },
          img: form.image,
          filterGenre: form.filterGenre
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        };
      }

      await updateRecentItem(section, item, payload);
      onSaved?.();
    } catch (e) {
      setError(e.message || 'Saqlashda xatolik.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-links-form">
      <p className="settings-links-form__hint">{hint}</p>
      {(section === 'movies' || section === 'actors' || section === 'genres') && (
        <>
          <label className="settings-links-form__label">Nomi (UZ)</label>
          <input className="settings-links-form__input" value={form.titleUz} onChange={(e) => setForm((p) => ({ ...p, titleUz: e.target.value }))} />
          <label className="settings-links-form__label">Nomi (RU)</label>
          <input className="settings-links-form__input" value={form.titleRu} onChange={(e) => setForm((p) => ({ ...p, titleRu: e.target.value }))} />
        </>
      )}

      {(section === 'movies' || section === 'actors' || section === 'banners' || section === 'genres') && (
        <>
          <label className="settings-links-form__label">Rasm URL</label>
          <input className="settings-links-form__input" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} />
        </>
      )}

      {section === 'banners' && (
        <>
          <label className="settings-links-form__label">movieId</label>
          <input className="settings-links-form__input" value={form.movieId} onChange={(e) => setForm((p) => ({ ...p, movieId: e.target.value }))} />
          <label className="settings-links-form__label">Sort</label>
          <input className="settings-links-form__input" type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
        </>
      )}

      {section === 'ads' && (
        <>
          <label className="settings-links-form__label">Video URL</label>
          <input className="settings-links-form__input" value={form.videoUrl} onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))} />
          <label className="settings-links-form__label">Sort</label>
          <input className="settings-links-form__input" type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
        </>
      )}

      {section === 'genres' && (
        <>
          <label className="settings-links-form__label">Filter janrlar (vergul)</label>
          <input className="settings-links-form__input" value={form.filterGenre} onChange={(e) => setForm((p) => ({ ...p, filterGenre: e.target.value }))} />
        </>
      )}

      {error ? <p className="settings-links-form__error">{error}</p> : null}
      <div className="settings-links-form__actions">
        <button type="button" className="settings-links-form__cancel-btn" onClick={onCancel}>Bekor qilish</button>
        <button type="button" className="settings-links-form__save-btn" onClick={onSave} disabled={saving}>
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}
