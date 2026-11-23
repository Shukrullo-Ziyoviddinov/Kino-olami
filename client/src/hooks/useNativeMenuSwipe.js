import { useEffect } from 'react';

const swipeBlocked = [
  '.banner', '.horizontal-scroll-wrapper', '.movies-content-wrapper', '.movies-grid',
  '.filters', '.movie-detail-image-block', '.embed-mobile-search-overlay',
  '.share-modal-overlay', '.filters-modal-overlay', '.watch-modal-overlay',
  'button', 'a', 'input', 'textarea', 'select', 'video', '[role="dialog"]',
].join(',');

export default function useNativeMenuSwipe() {
  useEffect(() => {
    if (!window.ReactNativeWebView) return undefined;
    let start = null;

    const cancel = () => { start = null; };
    const onStart = (event) => {
      cancel();
      const touch = event.touches[0];
      if (event.touches.length !== 1 || touch.clientX > 24 ||
          !(event.target instanceof Element) || event.target.closest(swipeBlocked)) return;
      start = { x: touch.clientX, y: touch.clientY };
    };
    const onMove = (event) => {
      if (!start) return;
      const touch = event.touches[0];
      if (event.touches.length !== 1 ||
          (Math.abs(touch.clientY - start.y) > 12 &&
           Math.abs(touch.clientY - start.y) >= Math.abs(touch.clientX - start.x))) cancel();
    };
    const onEnd = (event) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = Math.abs(touch.clientY - start.y);
      cancel();
      if (dx >= 56 && dx > dy * 1.5) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'kino-olami:open-menu' }));
      }
    };

    document.addEventListener('touchstart', onStart, { passive: true, capture: true });
    document.addEventListener('touchmove', onMove, { passive: true, capture: true });
    document.addEventListener('touchend', onEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', cancel, { passive: true, capture: true });
    return () => {
      document.removeEventListener('touchstart', onStart, true);
      document.removeEventListener('touchmove', onMove, true);
      document.removeEventListener('touchend', onEnd, true);
      document.removeEventListener('touchcancel', cancel, true);
    };
  }, []);
}
