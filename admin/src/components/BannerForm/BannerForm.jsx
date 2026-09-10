import { useEffect, useMemo, useRef, useState } from 'react';
import { createBanner, fetchMoviesForBanner } from '../../services/bannerApi';
import { uploadToR2, UPLOAD_FOLDERS } from '../../services/uploadApi';
import './BannerForm.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';
const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="110"><rect width="100%" height="100%" fill="%23eceff5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23656d82" font-size="11">No image</text></svg>';

function ChevronIcon() {
  return (
    <svg className="banner-form__chevron" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="banner-form__upload-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19 20H5v-2h14v2zM11 16h2v-6h3l-4-4-4 4h3v6z"
      />
    </svg>
  );
}

function asText(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function resolveMovieTitle(movie, lang = 'uz') {
  const title = movie?.title;
  if (title && typeof title === 'object') {
    const localized = asText(title?.[lang]) || asText(title?.uz) || asText(title?.ru);
    if (localized) return localized;
  }

  const direct =
    asText(title) ||
    asText(movie?.nameUZ) ||
    asText(movie?.nameRU) ||
    asText(movie?.name) ||
    asText(movie?.movieName);

  if (direct) return direct;

  return `Kino #${movie?.id ?? movie?.movieId ?? ''}`;
}

function resolveMoviePoster(movie, lang = 'uz') {
  const pickValue = (value) => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const localized = asText(value?.[lang]) || asText(value?.uz) || asText(value?.ru);
      if (localized) return localized;
      return (
        asText(value.url) ||
        asText(value.src) ||
        ''
      );
    }
    return '';
  };

  const raw =
    pickValue(movie?.homeImg) ||
    pickValue(movie?.homeImage) ||
    pickValue(movie?.poster) ||
    pickValue(movie?.image) ||
    pickValue(movie?.posterUrl) ||
    pickValue(movie?.cover);

  if (!raw) return '';
  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }
  if (raw.startsWith('/')) {
    return `${API_BASE}${raw}`;
  }
  return `${API_BASE}/${raw}`;
}

const EMPTY_LANG = {
  movieId: '',
  movieTitle: '',
  moviePoster: '',
  image: '',
  imagePreview: '',
  titleImg: '',
  titleImgPreview: '',
  description: '',
  sortOrder: '1',
};

export default function BannerForm({ onCancel, onSaved, mode = 'create', initialData = null, onSubmitData }) {
  const [langTab, setLangTab] = useState('uz');
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formByLang, setFormByLang] = useState({
    uz: { ...EMPTY_LANG },
    ru: { ...EMPTY_LANG },
  });

  const dropdownRef = useRef(null);
  const fileRef = useRef(null);
  const titleFileRef = useRef(null);
  const activeForm = formByLang[langTab];

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const base = {
        movieId: String(initialData.movieId ?? ''),
        movieTitle: resolveMovieTitle(initialData, 'uz'),
        moviePoster: resolveMoviePoster(initialData, 'uz'),
        image: initialData.image || '',
        imagePreview: initialData.image || '',
        titleImg: initialData.titleImg || '',
        titleImgPreview: initialData.titleImg || '',
        description: initialData.description || '',
        sortOrder: String(initialData.sortOrder || 1),
      };
      setFormByLang({ uz: { ...base }, ru: { ...base } });
      return;
    }

    const run = async () => {
      setLoadingMovies(true);
      try {
        const rows = await fetchMoviesForBanner();
        setMovies(rows);
      } catch (e) {
        setError(e.message || "Kinolar ro'yxatini olishda xatolik.");
      } finally {
        setLoadingMovies(false);
      }
    };
    run();
  }, [mode, initialData]);

  useEffect(() => {
    const onOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const canSave = useMemo(() => {
    return ['uz', 'ru'].every((lang) => {
      const item = formByLang[lang];
      return item.movieId && item.image && item.titleImg && item.description.trim() && item.sortOrder;
    });
  }, [formByLang]);

  const patchLang = (lang, patch) => {
    setFormByLang((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        ...patch,
      },
    }));
  };

  const onSelectMovie = (movie) => {
    patchLang(langTab, {
      movieId: String(movie.id ?? movie.movieId ?? ''),
      movieTitle: resolveMovieTitle(movie, langTab),
      moviePoster: resolveMoviePoster(movie, langTab),
    });
    setDropdownOpen(false);
  };

  const onPickFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const { url } = await uploadToR2(file, UPLOAD_FOLDERS.banners);
      patchLang(langTab, {
        image: url,
        imagePreview: url,
      });
    } catch (e) {
      setError(e.message || 'Banner rasmni R2 ga yuklashda xatolik.');
    } finally {
      setUploading(false);
    }
  };

  const onPickTitleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const { url } = await uploadToR2(file, UPLOAD_FOLDERS.banners);
      patchLang(langTab, {
        titleImg: url,
        titleImgPreview: url,
      });
    } catch (e) {
      setError(e.message || 'Title rasmni R2 ga yuklashda xatolik.');
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!canSave) {
      setError("UZ va RU bo'yicha barcha maydonlarni to'ldiring.");
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (mode === 'edit' && onSubmitData) {
        const item = formByLang[langTab];
        await onSubmitData({
          movieId: Number(item.movieId),
          image: item.image,
          titleImg: item.titleImg,
          description: item.description.trim(),
          sortOrder: Number(item.sortOrder),
        });
      } else {
        const baseBannerId = Date.now();
        await Promise.all(
          ['uz', 'ru'].map((lang) => {
            const item = formByLang[lang];
            return createBanner({
              bannerId: baseBannerId,
              movieId: Number(item.movieId),
              image: item.image,
              titleImg: item.titleImg,
              description: item.description.trim(),
              lang,
              isActive: true,
              sortOrder: Number(item.sortOrder),
            });
          })
        );
      }
      onSaved?.();
    } catch (e) {
      setError(e.message || 'Saqlashda xatolik yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="banner-form">
      <div className="banner-form__lang-tabs">
        <button
          type="button"
          className={`banner-form__tab${langTab === 'uz' ? ' is-active' : ''}`}
          onClick={() => setLangTab('uz')}
        >
          O'zbekcha
        </button>
        <button
          type="button"
          className={`banner-form__tab${langTab === 'ru' ? ' is-active' : ''}`}
          onClick={() => setLangTab('ru')}
        >
          Ruscha
        </button>
      </div>

      <label className="banner-form__label">Kino tanlash</label>
      <div className="banner-form__movie-picker" ref={dropdownRef}>
        <button
          type="button"
          className="banner-form__movie-trigger"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <span className="banner-form__movie-trigger-text">
            {activeForm.movieTitle || 'Kino tanlang'}
          </span>
          <ChevronIcon />
        </button>

        {dropdownOpen && (
          <div className="banner-form__movie-dropdown">
            {loadingMovies && <div className="banner-form__dropdown-hint">Yuklanmoqda...</div>}
            {!loadingMovies &&
              movies.map((movie, index) => (
                <button
                  key={String(movie?._id || `${movie?.id ?? movie?.movieId ?? 'movie'}-${index}`)}
                  type="button"
                  className="banner-form__movie-item"
                  onClick={() => onSelectMovie(movie)}
                >
                  <img
                    className="banner-form__movie-poster"
                    src={resolveMoviePoster(movie, langTab) || FALLBACK_POSTER}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
                  />
                  <span className="banner-form__movie-name">{resolveMovieTitle(movie, langTab)}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      <label className="banner-form__label">Banner rasm</label>
      <button
        type="button"
        className="banner-form__upload"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || saving}
      >
        {activeForm.imagePreview ? (
          <img className="banner-form__preview" src={activeForm.imagePreview} alt="Banner preview" />
        ) : (
          <div className="banner-form__upload-inner">
            <UploadIcon />
            <span>{uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
            <small>JPG, PNG, WEBP</small>
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        className="banner-form__file-input"
        type="file"
        accept="image/*"
        onChange={onPickFile}
      />

      <label className="banner-form__label">Kino nomi rasmi (fonisiz)</label>
      <button
        type="button"
        className="banner-form__upload banner-form__upload--title"
        onClick={() => titleFileRef.current?.click()}
        disabled={uploading || saving}
      >
        {activeForm.titleImgPreview ? (
          <img
            className="banner-form__preview banner-form__preview--title"
            src={activeForm.titleImgPreview}
            alt="Kino nomi rasmi"
          />
        ) : (
          <div className="banner-form__upload-inner">
            <UploadIcon />
            <span>{uploading ? 'Yuklanmoqda...' : 'Title rasm yuklash'}</span>
            <small>PNG, WEBP yoki SVG — shaffof fon</small>
          </div>
        )}
      </button>
      <input
        ref={titleFileRef}
        className="banner-form__file-input"
        type="file"
        accept="image/png,image/webp,image/svg+xml"
        onChange={onPickTitleFile}
      />

      <label htmlFor={`banner-description-${langTab}`} className="banner-form__label">
        Tavsif matni
      </label>
      <textarea
        id={`banner-description-${langTab}`}
        className="banner-form__input banner-form__textarea"
        rows="4"
        value={activeForm.description}
        onChange={(e) => patchLang(langTab, { description: e.target.value })}
        placeholder={langTab === 'uz' ? "Banner uchun o'zbekcha tavsif" : 'Описание баннера на русском'}
      />

      <label htmlFor="banner-sort-order" className="banner-form__label">
        Tartib raqami
      </label>
      <input
        id="banner-sort-order"
        className="banner-form__input"
        type="number"
        min="1"
        value={activeForm.sortOrder}
        onChange={(e) => patchLang(langTab, { sortOrder: e.target.value })}
      />

      {error ? <p className="banner-form__error">{error}</p> : null}

      <div className="banner-form__actions">
        <button type="button" className="banner-form__cancel-btn" onClick={onCancel}>
          Bekor qilish
        </button>
        <button
          type="button"
          className="banner-form__save-btn"
          onClick={onSave}
          disabled={saving || uploading}
        >
          {saving ? 'Saqlanmoqda...' : uploading ? 'Yuklanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}
