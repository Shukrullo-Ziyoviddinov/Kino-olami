import React, { useEffect, useRef, useState } from 'react';
import './TrillerVideoControls.css';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const TrillerVideoControls = ({
  videoRef,
  isPlaying,
  onPlayPause,
  show,
  onToggle,
  onInteraction,
}) => {
  const previewTimeRef = useRef(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return undefined;

    const onTime = () => {
      if (!isScrubbing) setCurrentTime(video.currentTime || 0);
    };
    const onMeta = () => setDuration(video.duration || 0);
    const onDur = () => setDuration(video.duration || 0);

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('durationchange', onDur);
    if (video.duration) setDuration(video.duration);

    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('durationchange', onDur);
    };
  }, [videoRef, isScrubbing]);

  const keepShown = () => {
    onInteraction?.();
  };

  const handleBack10 = (e) => {
    e.stopPropagation();
    const video = videoRef?.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
    keepShown();
  };

  const handleForward10 = (e) => {
    e.stopPropagation();
    const video = videoRef?.current;
    if (!video) return;
    const dur = Number.isFinite(video.duration) ? video.duration : video.currentTime + 10;
    video.currentTime = Math.min(dur, video.currentTime + 10);
    keepShown();
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    onPlayPause?.();
    keepShown();
  };

  const updateProgress = (clientX, container) => {
    const video = videoRef?.current;
    if (!video || !container || !Number.isFinite(video.duration) || video.duration <= 0) return 0;
    const rect = container.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = percent * video.duration;
    previewTimeRef.current = next;
    setPreviewTime(next);
    return next;
  };

  const commitPreview = () => {
    const video = videoRef?.current;
    const next = previewTimeRef.current;
    if (video && next >= 0) {
      video.currentTime = next;
      setCurrentTime(next);
    }
    setPreviewTime(0);
    previewTimeRef.current = 0;
    setIsScrubbing(false);
    keepShown();
  };

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, ((isScrubbing ? previewTime : currentTime) / duration) * 100))
      : 0;

  const visible = show || isScrubbing;

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    const interactive = e.target.closest(
      'button, .triller-progress-container, .triller-progress-time, .triller-video-controls-center'
    );
    if (!interactive) {
      onToggle?.();
    }
  };

  return (
    <div
      className={`triller-video-controls ${visible ? 'show' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="triller-video-controls-center">
        <button
          type="button"
          className="triller-video-control-btn"
          onClick={handleBack10}
          aria-label="Orqaga 10 soniya"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            <text x="8" y="15" fill="white" fontSize="8" fontWeight="bold">
              10
            </text>
          </svg>
        </button>

        <button
          type="button"
          className="triller-video-control-btn triller-video-control-btn-play"
          onClick={handlePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            {isPlaying ? (
              <>
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </>
            ) : (
              <polygon points="5 3 19 12 5 21 5 3" />
            )}
          </svg>
        </button>

        <button
          type="button"
          className="triller-video-control-btn"
          onClick={handleForward10}
          aria-label="Oldinga 10 soniya"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
            <text x="8" y="15" fill="white" fontSize="8" fontWeight="bold">
              10
            </text>
          </svg>
        </button>
      </div>

      <div className={`triller-video-bottom ${visible ? 'show' : ''}`}>
        <div
          className="triller-progress-container"
          onClick={(e) => {
            e.stopPropagation();
            const next = updateProgress(e.clientX, e.currentTarget);
            const video = videoRef?.current;
            if (video && next >= 0) {
              video.currentTime = next;
              setCurrentTime(next);
              setPreviewTime(0);
              previewTimeRef.current = 0;
            }
            keepShown();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsScrubbing(true);
            updateProgress(e.clientX, e.currentTarget);
            keepShown();
          }}
          onMouseMove={(e) => {
            if (!isScrubbing) return;
            e.stopPropagation();
            updateProgress(e.clientX, e.currentTarget);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            if (isScrubbing) commitPreview();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            if (isScrubbing) commitPreview();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsScrubbing(true);
            updateProgress(e.touches[0].clientX, e.currentTarget);
            keepShown();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            if (isScrubbing) updateProgress(e.touches[0].clientX, e.currentTarget);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            if (isScrubbing) commitPreview();
          }}
        >
          <div className="triller-progress-bar">
            <div className="triller-progress-filled" style={{ width: `${progressPercent}%` }}>
              <div className="triller-progress-thumb" />
            </div>
            {isScrubbing ? (
              <div className="triller-progress-tooltip" style={{ left: `${progressPercent}%` }}>
                {formatTime(previewTime)}
              </div>
            ) : null}
          </div>
        </div>
        <div className="triller-progress-time">
          <span>{formatTime(isScrubbing ? previewTime : currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default TrillerVideoControls;
