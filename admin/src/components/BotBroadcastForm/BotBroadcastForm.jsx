import { useEffect, useMemo, useRef, useState } from "react";
import { fetchMovies } from "../../services/movieApi";
import { sendBotBroadcast } from "../../services/botBroadcastApi";
import "./BotBroadcastForm.css";

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createMovieButton() {
  return { label: "", movieId: "" };
}

function createLinkButton() {
  return { label: "", url: "" };
}

const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;

export default function BotBroadcastForm({ onCancel, onSaved }) {
  const mediaRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [movies, setMovies] = useState([]);
  const [openPickerIndex, setOpenPickerIndex] = useState(null);
  const [movieSearch, setMovieSearch] = useState({});
  const [error, setError] = useState("");
  const [resultInfo, setResultInfo] = useState(null);
  const [form, setForm] = useState({
    title: "",
    text: "",
    mediaType: "",
    mediaDataUrl: "",
    movieButtons: [createMovieButton()],
    linkButtons: [createLinkButton()],
  });

  useEffect(() => {
    const run = async () => {
      setLoadingMovies(true);
      try {
        const rows = await fetchMovies();
        setMovies(rows);
      } catch (_error) {
        setMovies([]);
      } finally {
        setLoadingMovies(false);
      }
    };
    run();
  }, []);

  const patch = (patchData) => setForm((prev) => ({ ...prev, ...patchData }));

  const movieOptions = useMemo(
    () =>
      movies.map((movie) => {
        const id = movie?.id;
        const title = movie?.title?.uz || movie?.title?.ru || `Movie ${id}`;
        return { id, title };
      }),
    [movies]
  );

  const getMovieTitleById = (movieId) => {
    const found = movieOptions.find((item) => String(item.id) === String(movieId));
    return found?.title || "";
  };

  const onPickMedia = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    const mime = String(file.type || "");
    const mediaType = mime.startsWith("video/") ? "video" : mime.startsWith("image/") ? "photo" : "";
    if (!mediaType) {
      setError("Faqat rasm yoki video yuklang.");
      return;
    }
    const fileSizeMb = Number(file.size || 0) / (1024 * 1024);
    if (mediaType === "photo" && fileSizeMb > MAX_IMAGE_MB) {
      setError(`Rasm hajmi juda katta. Maksimal ${MAX_IMAGE_MB}MB.`);
      return;
    }
    if (mediaType === "video" && fileSizeMb > MAX_VIDEO_MB) {
      setError(`Video hajmi juda katta. Maksimal ${MAX_VIDEO_MB}MB.`);
      return;
    }
    try {
      const dataUrl = await toDataUrl(file);
      patch({ mediaType, mediaDataUrl: dataUrl });
    } catch (_error) {
      setError("Media yuklashda xatolik.");
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const addMovieButton = () =>
    patch({ movieButtons: [...form.movieButtons, createMovieButton()] });
  const removeMovieButton = (index) =>
    patch({ movieButtons: form.movieButtons.filter((_, i) => i !== index) });
  const patchMovieButton = (index, patchData) =>
    patch({
      movieButtons: form.movieButtons.map((item, i) => (i === index ? { ...item, ...patchData } : item)),
    });

  const getFilteredMovieOptions = (index) => {
    const searchText = String(movieSearch[index] || "").trim().toLowerCase();
    if (!searchText) return movieOptions;
    return movieOptions.filter((item) => item.title.toLowerCase().includes(searchText));
  };

  const addLinkButton = () =>
    patch({ linkButtons: [...form.linkButtons, createLinkButton()] });
  const removeLinkButton = (index) =>
    patch({ linkButtons: form.linkButtons.filter((_, i) => i !== index) });
  const patchLinkButton = (index, patchData) =>
    patch({
      linkButtons: form.linkButtons.map((item, i) => (i === index ? { ...item, ...patchData } : item)),
    });

  const onSubmit = async () => {
    setError("");
    setResultInfo(null);
    const movieButtons = form.movieButtons
      .map((item) => ({
        type: "movie",
        label: String(item.label || "").trim(),
        movieId: Number(item.movieId) || null,
      }))
      .filter((item) => item.label && item.movieId);
    const linkButtons = form.linkButtons
      .map((item) => ({
        type: "url",
        label: String(item.label || "").trim(),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.label && item.url);

    if (!form.title.trim() && !form.text.trim() && !form.mediaDataUrl) {
      setError("Kamida title, text yoki media kiriting.");
      return;
    }

    setSaving(true);
    try {
      const result = await sendBotBroadcast({
        title: form.title,
        text: form.text,
        mediaType: form.mediaType || null,
        mediaDataUrl: form.mediaDataUrl || null,
        buttons: [...movieButtons, ...linkButtons],
      });
      setResultInfo(result || null);
      if ((result?.total || 0) === 0) {
        setError("Hozircha bot foydalanuvchilari ro'yxatda yo'q (total: 0). User botga qayta /start bossa ro'yxatga tushadi.");
        return;
      }
      if ((result?.success || 0) === 0) {
        setError("Reklama yuborildi, lekin hech kimga yetib bormadi. Total/failed natijasini tekshiring.");
        return;
      }
      onSaved?.();
    } catch (e) {
      setError(e.message || "Yuborishda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bot-broadcast-form">
      <label className="bot-broadcast-form__label">Media (rasm yoki video)</label>
      <button type="button" className="bot-broadcast-form__media-btn" onClick={() => mediaRef.current?.click()}>
        {form.mediaDataUrl ? `Tanlandi (${form.mediaType})` : "Rasm/Video yuklash"}
      </button>
      <input
        ref={mediaRef}
        className="bot-broadcast-form__file-input"
        type="file"
        accept="image/*,video/*"
        onChange={onPickMedia}
      />

      <label className="bot-broadcast-form__label">Title</label>
      <input
        className="bot-broadcast-form__input"
        value={form.title}
        onChange={(e) => patch({ title: e.target.value })}
      />

      <label className="bot-broadcast-form__label">Text</label>
      <textarea
        className="bot-broadcast-form__textarea"
        value={form.text}
        onChange={(e) => patch({ text: e.target.value })}
      />

      <div className="bot-broadcast-form__section">
        <p className="bot-broadcast-form__section-title">Kino inline buttonlar</p>
        {form.movieButtons.map((item, index) => (
          <div className="bot-broadcast-form__row" key={`movie-${index}`}>
            <input
              className="bot-broadcast-form__input"
              placeholder="Button nomi"
              value={item.label}
              onChange={(e) => patchMovieButton(index, { label: e.target.value })}
            />
            <div className="bot-broadcast-form__picker-wrap">
              <input
                className="bot-broadcast-form__input"
                placeholder={loadingMovies ? "Kinolar yuklanmoqda..." : "Kinoni tanlang"}
                value={
                  openPickerIndex === index
                    ? String(movieSearch[index] || "")
                    : getMovieTitleById(item.movieId)
                }
                onFocus={() => setOpenPickerIndex(index)}
                onChange={(e) => {
                  setOpenPickerIndex(index);
                  setMovieSearch((prev) => ({ ...prev, [index]: e.target.value }));
                }}
              />
              {openPickerIndex === index ? (
                <div className="bot-broadcast-form__picker-list">
                  {getFilteredMovieOptions(index).slice(0, 40).map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      className="bot-broadcast-form__picker-item"
                      onClick={() => {
                        patchMovieButton(index, { movieId: movie.id });
                        setMovieSearch((prev) => ({ ...prev, [index]: movie.title }));
                        setOpenPickerIndex(null);
                      }}
                    >
                      {movie.title}
                    </button>
                  ))}
                  {!getFilteredMovieOptions(index).length ? (
                    <div className="bot-broadcast-form__picker-empty">Kino topilmadi</div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <button type="button" className="bot-broadcast-form__remove-btn" onClick={() => removeMovieButton(index)}>
              O'chirish
            </button>
          </div>
        ))}
        <button type="button" className="settings-links-form__add-btn" onClick={addMovieButton}>
          + Kino biriktirish qo'shish
        </button>
      </div>

      <div className="bot-broadcast-form__section">
        <p className="bot-broadcast-form__section-title">Oddiy link inline buttonlar</p>
        {form.linkButtons.map((item, index) => (
          <div className="bot-broadcast-form__row" key={`url-${index}`}>
            <input
              className="bot-broadcast-form__input"
              placeholder="Button nomi"
              value={item.label}
              onChange={(e) => patchLinkButton(index, { label: e.target.value })}
            />
            <input
              className="bot-broadcast-form__input"
              placeholder="https://..."
              value={item.url}
              onChange={(e) => patchLinkButton(index, { url: e.target.value })}
            />
            <button type="button" className="bot-broadcast-form__remove-btn" onClick={() => removeLinkButton(index)}>
              O'chirish
            </button>
          </div>
        ))}
        <button type="button" className="settings-links-form__add-btn" onClick={addLinkButton}>
          + Link biriktirish qo'shish
        </button>
      </div>

      {error ? <p className="bot-broadcast-form__error">{error}</p> : null}
      {resultInfo ? (
        <p className="bot-broadcast-form__hint">
          Natija: total {resultInfo.total || 0}, success {resultInfo.success || 0}, failed{" "}
          {resultInfo.failed || 0}
        </p>
      ) : null}

      <div className="bot-broadcast-form__actions">
        <button type="button" className="bot-broadcast-form__cancel-btn" onClick={onCancel}>
          Bekor qilish
        </button>
        <button type="button" className="bot-broadcast-form__save-btn" onClick={onSubmit} disabled={saving}>
          {saving ? "Yuborilmoqda..." : "Yuborish"}
        </button>
      </div>
    </div>
  );
}
