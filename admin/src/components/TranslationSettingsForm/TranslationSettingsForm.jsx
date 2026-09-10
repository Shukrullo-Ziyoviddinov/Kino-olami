import { useEffect, useState } from "react";
import { fetchTranslations, saveTranslations } from "../../services/translationsApi";
import "./TranslationSettingsForm.css";

function emptyRow() {
  return { key: "", uz: "", ru: "", isActive: true };
}

export default function TranslationSettingsForm({ onCancel, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const items = await fetchTranslations("common");
        setRows(items.map((item) => ({ key: item.key || "", uz: item.uz || "", ru: item.ru || "", isActive: true })));
      } catch (e) {
        setError(e.message || "Tarjimalarni olishda xatolik.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const patchRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));
  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const onSubmit = async () => {
    const filtered = rows
      .map((row) => ({
        key: String(row.key || "").trim(),
        uz: String(row.uz || ""),
        ru: String(row.ru || ""),
        isActive: row.isActive !== false,
      }))
      .filter((row) => row.key);

    setSaving(true);
    setError("");
    try {
      await saveTranslations("common", filtered);
      onSaved?.();
    } catch (e) {
      setError(e.message || "Saqlashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="translation-settings-form">
      <p className="translation-settings-form__hint">Tarjimalar (key, uz, ru) - tahrirlash, qo'shish, o'chirish</p>

      {loading ? (
        <p className="translation-settings-form__hint">Yuklanmoqda...</p>
      ) : (
        <div className="translation-settings-form__list">
          {rows.map((row, index) => (
            <div className="translation-settings-form__row" key={`${row.key || "new"}-${index}`}>
              <input
                className="translation-settings-form__input translation-settings-form__input--key"
                placeholder="key (masalan: navbar.search)"
                value={row.key}
                onChange={(e) => patchRow(index, { key: e.target.value })}
              />
              <textarea
                className="translation-settings-form__textarea"
                placeholder="UZ matn"
                value={row.uz}
                onChange={(e) => patchRow(index, { uz: e.target.value })}
              />
              <textarea
                className="translation-settings-form__textarea"
                placeholder="RU matn"
                value={row.ru}
                onChange={(e) => patchRow(index, { ru: e.target.value })}
              />
              <button
                type="button"
                className="translation-settings-form__remove-btn"
                onClick={() => removeRow(index)}
              >
                O'chirish
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="translation-settings-form__footer">
        <button type="button" className="translation-settings-form__add-btn" onClick={addRow}>
          + Yana qo'shish
        </button>

        {error ? <p className="translation-settings-form__error">{error}</p> : null}

        <div className="translation-settings-form__actions">
          <button type="button" className="translation-settings-form__cancel-btn" onClick={onCancel}>
            Bekor qilish
          </button>
          <button type="button" className="translation-settings-form__save-btn" onClick={onSubmit} disabled={saving || loading}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
