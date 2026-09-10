import { useEffect, useRef } from 'react';
import './ScrollTouch.css';

/**
 * Gorizontal scroll: barmoq bilan surish va sichqoncha bosib surish (pointer drag).
 * Scrollbar yashirin — `scroll-touch` klassi orqali.
 */
export default function ScrollTouch({ children, className = '', allowInteractiveDrag = false, ...rest }) {
  const elRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return undefined;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchScrollLeft = 0;
    let isTouching = false;
    let isHorizontal = null;

    const isInteractive = (target) =>
      Boolean(target?.closest('button, a, input, select, textarea, label, [role="button"]'));

    const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      if (!allowInteractiveDrag && isInteractive(e.target)) return;

      isMouseDownRef.current = true;
      hasDraggedRef.current = false;
      el.style.cursor = 'grabbing';
      startXRef.current = e.pageX - el.offsetLeft;
      startScrollLeftRef.current = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isMouseDownRef.current = false;
      el.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      el.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isMouseDownRef.current) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startXRef.current) * 1.8;
      if (Math.abs(walk) > 8) {
        hasDraggedRef.current = true;
        e.preventDefault();
      }
      if (hasDraggedRef.current) {
        el.scrollLeft = startScrollLeftRef.current - walk;
      }
    };

    const handleClickCapture = (e) => {
      if (!hasDraggedRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    };

    const handleTouchStart = (e) => {
      if (!allowInteractiveDrag && isInteractive(e.target)) return;
      isTouching = true;
      isHorizontal = null;
      hasDraggedRef.current = false;
      touchStartX = e.touches[0].pageX - el.offsetLeft;
      touchStartY = e.touches[0].clientY;
      touchScrollLeft = el.scrollLeft;
    };

    const handleTouchMove = (e) => {
      if (!isTouching) return;
      const currentX = e.touches[0].pageX - el.offsetLeft;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - touchStartX);
      const deltaY = Math.abs(currentY - touchStartY);

      if (isHorizontal === null) {
        if (deltaX < 5 && deltaY < 5) return;
        if (deltaY > deltaX) {
          isHorizontal = false;
          isTouching = false;
          return;
        }
        isHorizontal = true;
      }

      if (!isHorizontal) return;
      e.preventDefault();
      const walk = (currentX - touchStartX) * 1.8;
      if (Math.abs(walk) > 8) hasDraggedRef.current = true;
      el.scrollLeft = touchScrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isTouching = false;
      isHorizontal = null;
    };

    el.addEventListener('click', handleClickCapture, true);
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.style.cursor = 'grab';

    return () => {
      el.removeEventListener('click', handleClickCapture, true);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [allowInteractiveDrag]);

  return (
    <div ref={elRef} className={`scroll-touch ${className}`} {...rest}>
      {children}
    </div>
  );
}
