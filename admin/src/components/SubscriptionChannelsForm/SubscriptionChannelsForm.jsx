import { useEffect, useState } from "react";
import { fetchSocialLinks, saveSocialLinks } from "../../services/socialLinksApi";
import "./SubscriptionChannelsForm.css";

function emptyRow() {
  return { key: "", label: "", link: "", sortOrder: 0, isActive: true };
}

function toRows(group = {}) {
  return Object.entries(group).map(([key, value], index) => ({
    key,
    label: value?.label || "",
    link: value?.link || "",
    sortOrder: index + 1,
    isActive: true,
  }));
}

export default function SubscriptionChannelsForm({ onCancel, onSaved }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchSocialLinks();
        setRows(toRows(data?.subscription));
      } catch (e) {
        setError(e.message || "Ma'lumotlarni olishda xatolik.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const patchRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { ...emptyRow(), sortOrder: prev.length + 1 }]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    const prepared = rows
      .map((row, idx) => {
        const label = String(row.label || "").trim();
        const keyCandidate = String(row.key || "").trim();
        const key = keyCandidate || `subscription_${idx + 1}`;
        return {
          key,
          label,
          link: String(row.link || "").trim(),
          sortOrder: Number(row.sortOrder) || idx + 1,
          isActive: true,
        };
      })
      .filter((row) => row.label && row.link);

    setSaving(true);
    setError("");
    try {
      await saveSocialLinks("subscription", prepared);
      onSaved?.();
    } catch (e) {
      setError(e.message || "Saqlashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="subscription-channels-form">
      <p className="subscription-channels-form__hint">
        Telegram/ijtimoiy tarmoq linklarini qo'shing. Faqat bot admin bo'lgan Telegram kanallari tekshiriladi.
      </p>

      {loading ? (
        <p className="subscription-channels-form__hint">Yuklanmoqda...</p>
      ) : (
        <div className="subscription-channels-form__list">
          {rows.map((row, index) => (
            <div className="subscription-channels-form__card" key={`${row.key || "new"}-${index}`}>
              <div className="subscription-channels-form__grid">
                <label className="subscription-channels-form__label">Kanal nomi</label>
                <input
                  className="subscription-channels-form__input"
                  value={row.label}
                  onChange={(e) => patchRow(index, { label: e.target.value })}
                  placeholder="Masalan: KinoMax kanal"
                />
                <label className="subscription-channels-form__label">Link</label>
                <input
                  className="subscription-channels-form__input"
                  value={row.link}
                  onChange={(e) => patchRow(index, { link: e.target.value })}
                  placeholder="https://t.me/kanal_nomi"
                />
              </div>
              <button
                type="button"
                className="subscription-channels-form__remove-btn"
                onClick={() => removeRow(index)}
              >
                O'chirish
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="settings-links-form__add-btn" onClick={addRow}>
        + Yana qo'shish
      </button>

      {error ? <p className="subscription-channels-form__error">{error}</p> : null}

      <div className="subscription-channels-form__actions">
        <button type="button" className="subscription-channels-form__cancel-btn" onClick={onCancel}>
          Bekor qilish
        </button>
        <button
          type="button"
          className="subscription-channels-form__save-btn"
          onClick={onSubmit}
          disabled={saving || loading}
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
