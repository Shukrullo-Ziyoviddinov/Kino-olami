import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentLanguage } from '../../context/ContentLanguageContext';
import { useWishlist } from '../../context/WishlistContext';
import { getVideoEmbed } from '../../utils/videoEmbed';
import TrillerVideoControls from './TrillerVideoControls';
import TrillerModalListItem from './TrillerModalListItem';
import './TrillerModal.css';

const getLocalized = (value, lang) => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.uz || value.ru || '';
  }
  return String(value);
};

const getItemKey = (item) => item?.trillerId ?? item?.id;

const getLinkedMovieId = (item) => {
  const id = Number(item?.movieId);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const TrillerModal = ({ item, items = [], onSelect, onClose }) => {
  const navigate = useNavigate();
  const { contentLang } = useContentLanguage();
  const { addToWishlist, isInWishlist } = useWishlist();
  const sheetRef = useRef(null);
  const handleRef = useRef(null);
  const videoRef = useRef(null);
  const descRef = useRef(null);
  const descSheetRef = useRef(null);
  const descHandleRef = useRef(null);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const draggingRef = useRef(false);
  const closingRef = useRef(false);
  const descStartYRef = useRef(0);
  const descDragYRef = useRef(0);
  const descDraggingRef = useRef(false);
  const descClosingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dragClose, setDragClose] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [descClosing, setDescClosing] = useState(false);
  const [descDragY, setDescDragY] = useState(0);
  const [descIsDragging, setDescIsDragging] = useState(false);
  const [descDragClose, setDescDragClose] = useState(false);
  const [isDescTruncated, setIsDescTruncated] = useState(false);

  const activeKey = getItemKey(item);
  const name = getLocalized(item?.name, contentLang);
  const description = getLocalized(item?.description, contentLang);
  const listItems = Array.isArray(items) && items.length ? items : item ? [item] : [];
  const videoUrl = item?.trillerVideo ? String(item.trillerVideo).trim() : '';
  const embed = getVideoEmbed(videoUrl, { autoplay: true });
  const isEmbed = Boolean(embed?.embedUrl);
  const linkedMovieId = getLinkedMovieId(item);
  const watchLabel = contentLang === 'ru' ? 'Смотреть' : 'Tomosha qilish';
  const saveLabel = contentLang === 'ru' ? 'Сохранить' : 'Saqlash';
  const readMoreLabel = contentLang === 'ru' ? 'Читать далее' : "Ko'proq o'qish";
  const isSaved = linkedMovieId ? isInWishlist(linkedMovieId) : false;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    descClosingRef.current = false;
    setDescOpen(false);
    setDescClosing(false);
    setDescDragY(0);
    setDescIsDragging(false);
    setDescDragClose(false);
    descDragYRef.current = 0;
    descDraggingRef.current = false;
  }, [activeKey]);

  useEffect(() => {
    if (!description) {
      setIsDescTruncated(false);
      return undefined;
    }

    let raf = 0;
    const measure = () => {
      const el = descRef.current;
      if (!el) {
        setIsDescTruncated(false);
        return;
      }
      setIsDescTruncated(el.scrollHeight > el.clientHeight + 1);
    };

    raf = window.requestAnimationFrame(() => {
      raf = window.requestAnimationFrame(measure);
    });
    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [description, activeKey]);

  useEffect(() => {
    if (isEmbed) {
      setIsPlaying(true);
      setShowControls(false);
      return undefined;
    }

    const video = videoRef.current;
    if (!video) return undefined;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    setShowControls(true);
    video.play().catch(() => {
      setIsPlaying(false);
      setShowControls(true);
    });

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.pause();
    };
  }, [item?.trillerVideo, activeKey, isEmbed]);

  const requestClose = useCallback((options = {}) => {
    if (closingRef.current) return;
    closingRef.current = true;
    const fromDrag = Boolean(options.fromDrag);
    setClosing(true);
    videoRef.current?.pause?.();

    if (fromDrag) {
      setDragClose(true);
      const h = sheetRef.current?.offsetHeight || window.innerHeight;
      setDragY(Math.max(dragYRef.current, h));
    }

    window.setTimeout(() => onClose?.(), 240);
  }, [onClose]);

  const requestCloseDesc = useCallback((options = {}) => {
    if (descClosingRef.current) return;
    descClosingRef.current = true;
    const fromDrag = Boolean(options.fromDrag);
    setDescClosing(true);

    if (fromDrag) {
      setDescDragClose(true);
      const h = descSheetRef.current?.offsetHeight || window.innerHeight;
      setDescDragY(Math.max(descDragYRef.current, h));
    }

    window.setTimeout(() => {
      setDescOpen(false);
      setDescClosing(false);
      setDescDragY(0);
      setDescIsDragging(false);
      setDescDragClose(false);
      descDragYRef.current = 0;
      descDraggingRef.current = false;
      descClosingRef.current = false;
    }, 240);
  }, []);

  const openDescModal = () => {
    if (!description || !isDescTruncated) return;
    descClosingRef.current = false;
    setDescClosing(false);
    setDescDragY(0);
    setDescIsDragging(false);
    setDescDragClose(false);
    setDescOpen(true);
  };

  const handleWatchMovie = () => {
    if (!linkedMovieId) return;
    videoRef.current?.pause?.();
    onClose?.();
    navigate(`/movie/${linkedMovieId}`);
  };

  const handleSaveMovie = () => {
    if (!linkedMovieId) return;
    addToWishlist(linkedMovieId);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    setShowControls(true);
  };

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return undefined;

    const onStart = (e) => {
      if (closingRef.current || descOpen) return;
      if (window.innerWidth > 768) return;
      const y = e.touches[0].clientY;
      startYRef.current = y;
      dragYRef.current = 0;
      draggingRef.current = true;
      setIsDragging(true);
      setDragY(0);
    };

    const onMove = (e) => {
      if (!draggingRef.current || closingRef.current) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      const delta = Math.max(0, y - startYRef.current);
      dragYRef.current = delta;
      setDragY(delta);
    };

    const onEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);

      const sheetHeight = sheetRef.current?.offsetHeight || window.innerHeight;
      const threshold = sheetHeight * 0.2;
      const delta = dragYRef.current;

      if (delta >= threshold) {
        requestClose({ fromDrag: true });
      } else {
        dragYRef.current = 0;
        setDragY(0);
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [requestClose, descOpen]);

  useEffect(() => {
    const el = descHandleRef.current;
    if (!el || !descOpen) return undefined;

    const onStart = (e) => {
      if (descClosingRef.current) return;
      if (window.innerWidth > 768) return;
      const y = e.touches[0].clientY;
      descStartYRef.current = y;
      descDragYRef.current = 0;
      descDraggingRef.current = true;
      setDescIsDragging(true);
      setDescDragY(0);
    };

    const onMove = (e) => {
      if (!descDraggingRef.current || descClosingRef.current) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      const delta = Math.max(0, y - descStartYRef.current);
      descDragYRef.current = delta;
      setDescDragY(delta);
    };

    const onEnd = () => {
      if (!descDraggingRef.current) return;
      descDraggingRef.current = false;
      setDescIsDragging(false);

      const sheetHeight = descSheetRef.current?.offsetHeight || window.innerHeight;
      const threshold = sheetHeight * 0.2;
      const delta = descDragYRef.current;

      if (delta >= threshold) {
        requestCloseDesc({ fromDrag: true });
      } else {
        descDragYRef.current = 0;
        setDescDragY(0);
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [requestCloseDesc, descOpen]);

  const sheetTransform =
    dragY > 0 || dragClose
      ? `translateY(${dragY}px)`
      : undefined;

  const descSheetTransform =
    descDragY > 0 || descDragClose
      ? `translateY(${descDragY}px)`
      : undefined;

  return (
    <div
      className={[
        'triller-modal',
        closing ? 'is-closing' : '',
        isDragging ? 'is-dragging' : '',
        dragClose ? 'is-drag-close' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className="triller-modal-overlay"
        aria-label="Yopish"
        onClick={() => {
          if (descOpen) return;
          requestClose();
        }}
      />
      <div
        ref={sheetRef}
        className="triller-modal-sheet"
        style={{
          transform: sheetTransform,
          transition: isDragging ? 'none' : undefined,
        }}
      >
        <div ref={handleRef} className="triller-modal-handle-zone">
          <div className="triller-modal-handle" aria-hidden />
        </div>
        <button
          type="button"
          className="triller-modal-close"
          onClick={() => requestClose()}
          aria-label="Yopish"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="triller-modal-content">
          <div className="triller-modal-main">
            <div className="triller-modal-video-wrap">
              {isEmbed ? (
                <iframe
                  key={activeKey}
                  className="triller-modal-video triller-modal-video--embed"
                  src={embed.embedUrl}
                  title={name || 'Triller video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <>
                  <video
                    key={activeKey}
                    ref={videoRef}
                    className="triller-modal-video"
                    src={videoUrl ? encodeURI(videoUrl) : ''}
                    playsInline
                    preload="auto"
                    onClick={() => setShowControls((v) => !v)}
                  />
                  <TrillerVideoControls
                    videoRef={videoRef}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    show={showControls}
                    onToggle={() => setShowControls((v) => !v)}
                    onInteraction={() => setShowControls(true)}
                  />
                </>
              )}
            </div>

            <div className="triller-modal-meta">
              {name ? <h3 className="triller-modal-name">{name}</h3> : null}
              {description ? (
                <div className="triller-modal-description-wrap">
                  <p ref={descRef} className="triller-modal-description">{description}</p>
                  {isDescTruncated ? (
                    <button
                      type="button"
                      className="triller-modal-read-more"
                      onClick={openDescModal}
                    >
                      {readMoreLabel}
                    </button>
                  ) : null}
                </div>
              ) : null}
              {linkedMovieId ? (
                <div className="triller-modal-actions">
                  <button
                    type="button"
                    className="triller-modal-watch-btn"
                    onClick={handleWatchMovie}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                    <span>{watchLabel}</span>
                  </button>
                  <button
                    type="button"
                    className={`triller-modal-save-btn${isSaved ? ' is-saved' : ''}`}
                    onClick={handleSaveMovie}
                    aria-label={saveLabel}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={isSaved ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{saveLabel}</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {listItems.length > 0 ? (
            <div className="triller-modal-side">
              <h4 className="triller-modal-list-title">
                {contentLang === 'ru' ? 'Другие трейлеры' : 'Boshqa trillerlar'}
              </h4>
              <div className="triller-modal-list">
                {listItems.map((row) => (
                  <TrillerModalListItem
                    key={getItemKey(row)}
                    row={row}
                    isActive={getItemKey(row) === activeKey}
                    contentLang={contentLang}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {descOpen ? (
        <div
          className={[
            'triller-desc-modal',
            descClosing ? 'is-closing' : '',
            descIsDragging ? 'is-dragging' : '',
            descDragClose ? 'is-drag-close' : '',
          ].filter(Boolean).join(' ')}
        >
          <button
            type="button"
            className="triller-desc-modal-overlay"
            aria-label="Yopish"
            onClick={() => requestCloseDesc()}
          />
          <div
            ref={descSheetRef}
            className="triller-desc-modal-sheet"
            style={{
              transform: descSheetTransform,
              transition: descIsDragging ? 'none' : undefined,
            }}
            role="dialog"
            aria-modal="true"
            aria-label={name || readMoreLabel}
          >
            <div ref={descHandleRef} className="triller-desc-modal-handle-zone">
              <div className="triller-desc-modal-handle" aria-hidden />
            </div>
            <button
              type="button"
              className="triller-desc-modal-close"
              onClick={() => requestCloseDesc()}
              aria-label="Yopish"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="triller-desc-modal-content">
              {name ? <h3 className="triller-desc-modal-title">{name}</h3> : null}
              <p className="triller-desc-modal-text">{description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TrillerModal;
