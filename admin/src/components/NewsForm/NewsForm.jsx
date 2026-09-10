import { useEffect, useMemo, useRef, useState } from "react";
import { createNews, fetchNews } from "../../services/newsApi";
import { uploadToR2, UPLOAD_FOLDERS } from "../../services/uploadApi";
import { getVideoEmbed } from "../../utils/videoEmbed";
import "./NewsForm.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

const NEWS_SECTIONS = [
  { value: "yangiliklar", label: "Yangiliklar (featured)" },
  { value: "trenddagiYangiliklar", label: "Trenddagi yangiliklar" },
  { value: "yangiliklarGrid", label: "Yangiliklar grid" },
];

function UploadIcon() {
  return (
    <svg className="news-form__upload-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19 20H5v-2h14v2zM11 16h2v-6h3l-4-4-4 4h3v6z"
      />
    </svg>
  );
}

function toMediaUrl(path) {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

export default function NewsForm({
  onCancel,
  onSaved,
  mode = "create",
  initialData = null,
  onSubmitData,
}) {
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    newsId: "",
    section: "yangiliklar",
    nameUz: "",
    nameRu: "",
    descriptionUz: "",
    descriptionRu: "",
    img: "",
    imagePreview: "",
    video: "",
    isActive: true,
    sortOrder: "1",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const img = initialData?.img || "";
      setForm({
        newsId: String(initialData.newsId ?? initialData.id ?? ""),
        section: initialData?.section || "yangiliklar",
        nameUz: initialData?.name?.uz || "",
        nameRu: initialData?.name?.ru || "",
        descriptionUz: initialData?.description?.uz || "",
        descriptionRu: initialData?.description?.ru || "",
        img,
        imagePreview: img,
        video: initialData?.video || "",
        isActive: initialData?.isActive !== false,
        sortOrder: String(initialData?.sortOrder ?? 1),
      });
      return;
    }

    const loadNextId = async () => {
      try {
        const rows = await fetchNews();
        const maxId = rows.reduce(
          (max, item) => Math.max(max, Number(item.newsId ?? item.id) || 0),
          0
        );
        const nextSort =
          rows.reduce((max, item) => Math.max(max, Number(item.sortOrder) || 0), 0) +
          1;
        setForm((prev) => ({
          ...prev,
          newsId: String(maxId + 1),
          sortOrder: String(nextSort),
        }));
      } catch {
        /* ignore */
      }
    };
    loadNextId();
  }, [mode, initialData]);

  const needsVideo = form.section === "trenddagiYangiliklar";

  const canSave = useMemo(() => {
    const base =
      form.nameUz.trim() &&
      form.nameRu.trim() &&
      form.img &&
      form.section;
    if (!base) return false;
    if (needsVideo && !form.video.trim()) return false;
    return true;
  }, [form.nameUz, form.nameRu, form.img, form.section, form.video, needsVideo]);

  const patch = (patchData) => setForm((prev) => ({ ...prev, ...patchData }));

  const onSectionChange = (section) => {
    if (section === "trenddagiYangiliklar") {
      patch({ section });
      return;
    }
    patch({ section, video: "" });
  };

  const videoRaw = needsVideo ? form.video.trim() : "";
  const embed = getVideoEmbed(videoRaw);
  const embedUrl = embed?.embedUrl || "";
  const videoPreview = embedUrl || toMediaUrl(videoRaw);
  const imagePreviewSrc = form.imagePreview
    ? toMediaUrl(form.imagePreview)
    : "";

  const onPickImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const { url } = await uploadToR2(file, UPLOAD_FOLDERS.news);
      patch({ img: url, imagePreview: url });
    } catch (e) {
      setError(e.message || "News rasmni R2 ga yuklashda xatolik.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!canSave) {
      setError(
        needsVideo
          ? "Nomi (UZ/RU), bo'lim, rasm va video URL majburiy."
          : "Nomi (UZ/RU), bo'lim va rasm majburiy."
      );
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {
        newsId: Number(form.newsId) || undefined,
        section: form.section,
        name: {
          uz: form.nameUz.trim(),
          ru: form.nameRu.trim(),
        },
        description: {
          uz: form.descriptionUz.trim(),
          ru: form.descriptionRu.trim(),
        },
        img: form.img,
        video: needsVideo ? form.video.trim() : "",
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 1,
      };
      if (mode === "edit" && onSubmitData) {
        await onSubmitData(payload);
      } else {
        await createNews(payload);
      }
      onSaved?.();
    } catch (e) {
      setError(e.message || "Saqlashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="news-form">
      <label className="news-form__label" htmlFor="news-id">
        News ID
      </label>
      <input
        id="news-id"
        className="news-form__input"
        type="number"
        min="1"
        value={form.newsId}
        onChange={(e) => patch({ newsId: e.target.value })}
      />

      <label className="news-form__label" htmlFor="news-section">
        Bo&apos;lim (section)
      </label>
      <select
        id="news-section"
        className="news-form__input"
        value={form.section}
        onChange={(e) => onSectionChange(e.target.value)}
      >
        {NEWS_SECTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <label className="news-form__label" htmlFor="news-name-uz">
        Nomi (UZ)
      </label>
      <input
        id="news-name-uz"
        className="news-form__input"
        type="text"
        placeholder="Joker 2 treyleri chiqdi"
        value={form.nameUz}
        onChange={(e) => patch({ nameUz: e.target.value })}
      />

      <label className="news-form__label" htmlFor="news-name-ru">
        Nomi (RU)
      </label>
      <input
        id="news-name-ru"
        className="news-form__input"
        type="text"
        placeholder="Вышел трейлер Джокера 2"
        value={form.nameRu}
        onChange={(e) => patch({ nameRu: e.target.value })}
      />

      <label className="news-form__label" htmlFor="news-desc-uz">
        Tavsif (UZ)
      </label>
      <textarea
        id="news-desc-uz"
        className="news-form__textarea"
        rows={3}
        value={form.descriptionUz}
        onChange={(e) => patch({ descriptionUz: e.target.value })}
      />

      <label className="news-form__label" htmlFor="news-desc-ru">
        Tavsif (RU)
      </label>
      <textarea
        id="news-desc-ru"
        className="news-form__textarea"
        rows={3}
        value={form.descriptionRu}
        onChange={(e) => patch({ descriptionRu: e.target.value })}
      />

      <label className="news-form__label">Rasm</label>
      <button
        type="button"
        className="news-form__upload"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || saving}
      >
        {imagePreviewSrc ? (
          <img
            className="news-form__img-preview"
            src={imagePreviewSrc}
            alt="News rasm"
          />
        ) : (
          <div className="news-form__upload-inner">
            <UploadIcon />
            <span>{uploading ? "Yuklanmoqda..." : "Rasm yuklash"}</span>
            <small>JPG, PNG, WEBP, AVIF</small>
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        className="news-form__file-input"
        type="file"
        accept="image/*"
        onChange={onPickImage}
      />

      {needsVideo ? (
        <>
          <label className="news-form__label" htmlFor="news-video">
            Video URL (majburiy) — mp4, YouTube yoki Mover.uz
          </label>
          <input
            id="news-video"
            className="news-form__input"
            type="text"
            placeholder="https://youtu.be/... | https://mover.uz/watch/... | /video/trailer.mp4"
            value={form.video}
            onChange={(e) => patch({ video: e.target.value })}
          />
          <div className="news-form__preview-box">
            {embedUrl ? (
              <iframe
                key={embedUrl}
                className="news-form__video-preview news-form__video-preview--embed"
                src={embedUrl}
                title="Video preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : videoPreview ? (
              <video
                key={videoPreview}
                className="news-form__video-preview"
                src={videoPreview}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <span className="news-form__preview-empty">
                Video URL kiriting — preview shu yerda chiqadi
              </span>
            )}
          </div>
        </>
      ) : null}

      <label className="news-form__switch">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => patch({ isActive: e.target.checked })}
        />
        <span>Faol</span>
      </label>

      <label className="news-form__label" htmlFor="news-sort">
        Tartib (sortOrder)
      </label>
      <input
        id="news-sort"
        className="news-form__input"
        type="number"
        min="1"
        value={form.sortOrder}
        onChange={(e) => patch({ sortOrder: e.target.value })}
      />

      {error ? <p className="news-form__error">{error}</p> : null}

      <div className="news-form__actions">
        <button type="button" className="news-form__cancel-btn" onClick={onCancel}>
          Bekor qilish
        </button>
        <button
          type="button"
          className="news-form__save-btn"
          onClick={onSubmit}
          disabled={saving || uploading}
        >
          {saving ? "Saqlanmoqda..." : uploading ? "Yuklanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
