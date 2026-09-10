import { useEffect, useMemo, useRef, useState } from "react";
import { createAd, fetchAds } from "../../services/adsApi";
import { uploadToR2, UPLOAD_FOLDERS } from "../../services/uploadApi";
import UploadProgress from "../UploadProgress/UploadProgress";
import "./AdsForm.css";

function UploadIcon() {
  return (
    <svg className="ads-form__upload-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19 20H5v-2h14v2zM11 16h2v-6h3l-4-4-4 4h3v6z"
      />
    </svg>
  );
}

export default function AdsForm({ onCancel, onSaved, mode = "create", initialData = null, onSubmitData }) {
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    videoUrl: "",
    sortOrder: "1",
    isActive: true,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm((prev) => ({
        ...prev,
        videoUrl: initialData.videoUrl || "",
        sortOrder: String(initialData.sortOrder || 1),
        isActive: initialData.isActive !== false,
      }));
      return;
    }

    const loadNextOrder = async () => {
      try {
        const ads = await fetchAds();
        const maxOrder = ads.reduce((max, item) => Math.max(max, Number(item.sortOrder) || 0), 0);
        setForm((prev) => ({ ...prev, sortOrder: String(maxOrder + 1) }));
      } catch {
        /* ignore */
      }
    };
    loadNextOrder();
  }, [mode, initialData]);

  const canSave = useMemo(() => form.videoUrl && form.sortOrder, [form.videoUrl, form.sortOrder]);

  const patch = (patchData) => setForm((prev) => ({ ...prev, ...patchData }));

  const onPickVideo = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setSelectedFileName(file.name || "");
    setError("");
    setUploading(true);
    setUploadProgress(1);
    try {
      const { url } = await uploadToR2(file, UPLOAD_FOLDERS.ads, {
        onProgress: setUploadProgress,
      });
      patch({ videoUrl: url });
      setUploadProgress(100);
    } catch (e) {
      setError(e.message || "Video ni R2 ga yuklashda xatolik.");
      patch({ videoUrl: "" });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!canSave) {
      setError("Video va tartib raqami majburiy.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {
        videoUrl: form.videoUrl,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 1,
      };
      if (mode === "edit" && onSubmitData) {
        await onSubmitData(payload);
      } else {
        await createAd(payload);
      }
      onSaved?.();
    } catch (e) {
      setError(e.message || "Saqlashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ads-form">
      <label className="ads-form__label">Reklama video</label>
      <button
        type="button"
        className="ads-form__upload"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || saving}
      >
        <div className="ads-form__upload-inner">
          <UploadIcon />
          <span>
            {uploading
              ? `Video yuklanmoqda... ${uploadProgress}%`
              : form.videoUrl
              ? "Video tanlandi"
              : "Video yuklash"}
          </span>
          {selectedFileName ? <small className="ads-form__file-name">{selectedFileName}</small> : null}
          <small>MP4, WEBM</small>
          <UploadProgress show={uploading || uploadProgress > 0} progress={uploadProgress} />
        </div>
      </button>
      <input
        ref={fileRef}
        className="ads-form__file-input"
        type="file"
        accept="video/*"
        onChange={onPickVideo}
      />

      <label className="ads-form__label" htmlFor="ads-sort-order">
        Tartib raqami
      </label>
      <input
        id="ads-sort-order"
        className="ads-form__input"
        type="number"
        min="1"
        value={form.sortOrder}
        onChange={(e) => patch({ sortOrder: e.target.value })}
      />

      <label className="ads-form__switch">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => patch({ isActive: e.target.checked })}
        />
        <span>Faol</span>
      </label>

      {error ? <p className="ads-form__error">{error}</p> : null}

      <div className="ads-form__actions">
        <button type="button" className="ads-form__cancel-btn" onClick={onCancel}>
          Bekor qilish
        </button>
        <button
          type="button"
          className="ads-form__save-btn"
          onClick={onSubmit}
          disabled={saving || uploading}
        >
          {saving ? "Saqlanmoqda..." : uploading ? "Yuklanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
