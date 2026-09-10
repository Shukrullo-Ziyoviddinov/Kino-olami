import "./UploadProgress.css";

export default function UploadProgress({ progress = 0, show = false, className = "" }) {
  if (!show) return null;
  const safe = Math.min(100, Math.max(0, Number(progress) || 0));
  return (
    <div className={`upload-progress ${className}`.trim()}>
      <div className="upload-progress__fill" style={{ width: `${safe}%` }} />
    </div>
  );
}
