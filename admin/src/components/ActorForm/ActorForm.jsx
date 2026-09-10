import { useEffect, useMemo, useRef, useState } from "react";
import { createActor, fetchNextActorId } from "../../services/actorApi";
import { uploadToR2, UPLOAD_FOLDERS } from "../../services/uploadApi";
import "./ActorForm.css";

function UploadIcon() {
  return (
    <svg className="actor-form__upload-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19 20H5v-2h14v2zM11 16h2v-6h3l-4-4-4 4h3v6z"
      />
    </svg>
  );
}

export default function ActorForm({ onCancel, onSaved, mode = "create", initialData = null, onSubmitData }) {
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    actorId: "",
    nameUz: "",
    nameRu: "",
    image: "",
    imagePreview: "",
    infoUz: "",
    infoRu: "",
    isActive: true,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm((prev) => ({
        ...prev,
        actorId: String(initialData.actorId ?? ""),
        nameUz: initialData?.name?.uz || "",
        nameRu: initialData?.name?.ru || "",
        image: initialData?.image || "",
        imagePreview: initialData?.image || "",
        infoUz: initialData?.info?.uz || "",
        infoRu: initialData?.info?.ru || "",
        isActive: initialData?.isActive !== false,
      }));
      return;
    }

    const loadNextId = async () => {
      try {
        const nextId = await fetchNextActorId();
        if (Number.isFinite(nextId) && nextId > 0) {
          setForm((prev) => ({ ...prev, actorId: String(nextId) }));
        }
      } catch {
        /* ignore */
      }
    };
    loadNextId();
  }, [mode, initialData]);

  const canSave = useMemo(() => {
    return form.nameUz.trim() && form.nameRu.trim() && form.image;
  }, [form.nameUz, form.nameRu, form.image]);

  const patch = (patchData) => setForm((prev) => ({ ...prev, ...patchData }));

  const onPickImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const { url } = await uploadToR2(file, UPLOAD_FOLDERS.actors);
      patch({ image: url, imagePreview: url });
    } catch (e) {
      setError(e.message || "Actor rasmni R2 ga yuklashda xatolik.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!canSave) {
      setError("Nomi (UZ/RU) va rasm majburiy.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {
        actorId: Number(form.actorId) || undefined,
        name: {
          uz: form.nameUz.trim(),
          ru: form.nameRu.trim(),
        },
        image: form.image,
        info: {
          uz: form.infoUz.trim(),
          ru: form.infoRu.trim(),
        },
        isActive: form.isActive,
      };
      if (mode === "edit" && onSubmitData) {
        await onSubmitData(payload);
      } else {
        await createActor(payload);
      }
      onSaved?.();
    } catch (e) {
      setError(e.message || "Saqlashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="actor-form">
      <label className="actor-form__label" htmlFor="actor-id">
        Actor ID
      </label>
      <input
        id="actor-id"
        className="actor-form__input"
        type="number"
        min="1"
        value={form.actorId}
        onChange={(e) => patch({ actorId: e.target.value })}
      />

      <label className="actor-form__label" htmlFor="actor-name-uz">
        Ismi (UZ)
      </label>
      <input
        id="actor-name-uz"
        className="actor-form__input"
        type="text"
        placeholder="Leonardo DiCaprio"
        value={form.nameUz}
        onChange={(e) => patch({ nameUz: e.target.value })}
      />

      <label className="actor-form__label" htmlFor="actor-name-ru">
        Ismi (RU)
      </label>
      <input
        id="actor-name-ru"
        className="actor-form__input"
        type="text"
        placeholder="Леонардо ДиКаприо"
        value={form.nameRu}
        onChange={(e) => patch({ nameRu: e.target.value })}
      />

      <label className="actor-form__label">Rasm</label>
      <button
        type="button"
        className="actor-form__upload"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || saving}
      >
        {form.imagePreview ? (
          <img className="actor-form__preview" src={form.imagePreview} alt="Actor preview" />
        ) : (
          <div className="actor-form__upload-inner">
            <UploadIcon />
            <span>{uploading ? "Yuklanmoqda..." : "Rasm yuklash"}</span>
            <small>JPG, PNG, WEBP</small>
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        className="actor-form__file-input"
        type="file"
        accept="image/*"
        onChange={onPickImage}
      />

      <label className="actor-form__label" htmlFor="actor-info-uz">
        Ma'lumot (UZ)
      </label>
      <textarea
        id="actor-info-uz"
        className="actor-form__textarea"
        rows={3}
        value={form.infoUz}
        onChange={(e) => patch({ infoUz: e.target.value })}
      />

      <label className="actor-form__label" htmlFor="actor-info-ru">
        Ma'lumot (RU)
      </label>
      <textarea
        id="actor-info-ru"
        className="actor-form__textarea"
        rows={3}
        value={form.infoRu}
        onChange={(e) => patch({ infoRu: e.target.value })}
      />

      <label className="actor-form__switch">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => patch({ isActive: e.target.checked })}
        />
        <span>Faol</span>
      </label>

      {error ? <p className="actor-form__error">{error}</p> : null}

      <div className="actor-form__actions">
        <button type="button" className="actor-form__cancel-btn" onClick={onCancel}>
          Bekor qilish
        </button>
        <button
          type="button"
          className="actor-form__save-btn"
          onClick={onSubmit}
          disabled={saving || uploading}
        >
          {saving ? "Saqlanmoqda..." : uploading ? "Yuklanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
