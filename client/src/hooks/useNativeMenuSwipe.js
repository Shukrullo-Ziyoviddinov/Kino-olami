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
    let dragging = false;
    let lastDistance = 0;

    const send = (phase, dx = 0) => {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'kino-olami:menu-swipe', phase, dx,
      }));
    };
    const finish = (phase, dx = 0) => {
      if (dragging) send(phase, dx);
      dragging = false;
      start = null;
      lastDistance = 0;
    };
    const cancel = () => finish('cancel');
    const onTouchCancel = () => finish('end', lastDistance);
    const onStart = (event) => {
      cancel();
      const touch = event.touches[0];
      if (event.touches.length !== 1 || touch.clientX > 24 ||
          !(event.target instanceof Element) || event.target.closest(swipeBlocked)) return;
      start = { x: touch.clientX, y: touch.clientY };
    };
    const onMove = (event) => {
      if (!start) return;
      if (event.touches.length !== 1) {
        cancel();
        return;
      }
      const touch = event.touches[0];
      const dx = touch.clientX - start.x;
      const dy = Math.abs(touch.clientY - start.y);
      if (!dragging && dy > 12 && dy >= Math.abs(dx)) {
        cancel();
        return;
      }
      if (!dragging && dx > 14 && dx > dy * 1.5) dragging = true;
      if (dragging) {
        if (event.cancelable) event.preventDefault();
        lastDistance = Math.max(0, dx);
        send('move', lastDistance);
      }
    };
    const onEnd = (event) => {
      const touch = event.changedTouches[0];
      finish('end', start && touch ? Math.max(0, touch.clientX - start.x) : lastDistance);
    };

    document.addEventListener('touchstart', onStart, { passive: true, capture: true });
    document.addEventListener('touchmove', onMove, { passive: false, capture: true });
    document.addEventListener('touchend', onEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', onTouchCancel, { passive: true, capture: true });
    return () => {
      cancel();
      document.removeEventListener('touchstart', onStart, true);
      document.removeEventListener('touchmove', onMove, true);
      document.removeEventListener('touchend', onEnd, true);
      document.removeEventListener('touchcancel', onTouchCancel, true);
    };
  }, []);
}
