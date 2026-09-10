import React, { useRef, useState, useEffect, useCallback } from 'react';
import './HorizontalScroll.css';

// Carousel drag: sekin + foizga yetmasa → joyiga qaytadi, yetganda yoki tez surganda → keyingiga
const DRAG_THRESHOLD_PERCENT = 0.4;
const VELOCITY_THRESHOLD = 0.12;
const CLICK_THRESHOLD = 8;

const HorizontalScroll = ({ children, scrollAmount = 400 }) => {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const justFinishedDrag = useRef(false);

  // translateX px da (0 = boshlang'ich, manfiy = o'ngga scroll)
  const translateX = useRef(0);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartTranslate = useRef(0);
  const dragStartTime = useRef(0);
  const lastPointX = useRef(0);
  const isHorizontalDrag = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getMaxScroll = useCallback(() => {
    if (!trackRef.current || !wrapperRef.current) return 0;
    return Math.max(0, trackRef.current.scrollWidth - wrapperRef.current.clientWidth);
  }, []);

  const getItemWidth = useCallback(() => {
    if (!trackRef.current?.children?.[0]) return scrollAmount;
    const first = trackRef.current.children[0];
    const style = window.getComputedStyle(trackRef.current);
    const gap = parseFloat(style.gap) || 12;
    return first.offsetWidth + gap;
  }, [scrollAmount]);

  /**
   * Snap nuqtalari: har doim 0 (bosh) va -maxScroll (oxir) bor.
   * Kam element bo'lsa ham bosh to'liq ko'rinadi.
   */
  const getSnapPoints = useCallback(() => {
    const maxScroll = getMaxScroll();
    if (maxScroll <= 0) return [0];

    const itemWidth = getItemWidth();
    const points = [0];

    if (itemWidth > 0) {
      for (let x = itemWidth; x < maxScroll - 0.5; x += itemWidth) {
        points.push(-x);
      }
    }

    if (points[points.length - 1] !== -maxScroll) {
      points.push(-maxScroll);
    }

    return points;
  }, [getItemWidth, getMaxScroll]);

  const findNearestSnapIndex = useCallback((value, points) => {
    let bestIdx = 0;
    let bestDist = Math.abs(value - points[0]);
    for (let i = 1; i < points.length; i += 1) {
      const dist = Math.abs(value - points[i]);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, []);

  const snapToNearest = useCallback((value) => {
    const points = getSnapPoints();
    return points[findNearestSnapIndex(value, points)];
  }, [getSnapPoints, findNearestSnapIndex]);

  const updateTranslate = useCallback((value) => {
    if (!trackRef.current || !wrapperRef.current) return;
    const maxScroll = getMaxScroll();
    translateX.current = Math.max(-maxScroll, Math.min(0, value));
    trackRef.current.style.transform = `translateX(${translateX.current}px)`;
  }, [getMaxScroll]);

  const checkScrollability = useCallback(() => {
    if (!wrapperRef.current || !trackRef.current) return;
    const maxScroll = getMaxScroll();
    const tx = translateX.current;
    setCanScrollLeft(tx < -1);
    setCanScrollRight(tx > -maxScroll + 1);
  }, [getMaxScroll]);

  useEffect(() => {
    const runCheck = () => {
      // Kontent o'zgarganda chegaradan chiqib qolmasin
      updateTranslate(translateX.current);
      checkScrollability();
    };
    runCheck();
    const t = setTimeout(runCheck, 100);
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (wrapper && track) {
      const ro = new ResizeObserver(runCheck);
      ro.observe(wrapper);
      ro.observe(track);
      return () => {
        clearTimeout(t);
        ro.disconnect();
      };
    }
    return () => clearTimeout(t);
  }, [children, checkScrollability, updateTranslate]);

  const animateTo = useCallback((target) => {
    if (!wrapperRef.current || !trackRef.current) return;
    const snapped = snapToNearest(target);
    trackRef.current.style.transition = 'transform 0.3s ease-out';
    updateTranslate(snapped);
    setTimeout(() => {
      if (trackRef.current) trackRef.current.style.transition = '';
      // Floating point / rounding — boshda aniq 0
      if (Math.abs(translateX.current) < 1) {
        updateTranslate(0);
      }
      checkScrollability();
    }, 300);
  }, [snapToNearest, updateTranslate, checkScrollability]);

  const handleScroll = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    const points = getSnapPoints();
    const currentIndex = findNearestSnapIndex(translateX.current, points);
    const nextIndex = direction === 'left'
      ? Math.max(0, currentIndex - 1)
      : Math.min(points.length - 1, currentIndex + 1);
    animateTo(points[nextIndex]);
  };

  // ========== MOUSE DRAG (Desktop) ==========
  const handleMouseDown = (e) => {
    if (isMobile) return;
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartTranslate.current = translateX.current;
    dragStartTime.current = Date.now();
    lastPointX.current = e.clientX;
    if (trackRef.current) trackRef.current.style.transition = '';
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    lastPointX.current = e.clientX;
    const delta = dragStartX.current - e.clientX;
    updateTranslate(dragStartTranslate.current - delta);
    checkScrollability();
  }, [isDragging, updateTranslate, checkScrollability]);

  const resolveDragTarget = useCallback(() => {
    const delta = dragStartX.current - lastPointX.current;
    const duration = Date.now() - dragStartTime.current;
    const velocity = duration > 0 ? Math.abs(delta) / duration : 0;
    const itemWidth = getItemWidth();
    const thresholdDistance = itemWidth * DRAG_THRESHOLD_PERCENT;
    const isFastDrag = velocity > VELOCITY_THRESHOLD;
    const passedThreshold = Math.abs(delta) > thresholdDistance;

    const points = getSnapPoints();
    const startIndex = findNearestSnapIndex(dragStartTranslate.current, points);

    if (isFastDrag || passedThreshold) {
      const direction = delta > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(startIndex + direction, points.length - 1));
      return points[nextIndex];
    }

    // Joyiga qaytish yoki joriy holatga yaqin snap
    return snapToNearest(translateX.current);
  }, [getItemWidth, getSnapPoints, findNearestSnapIndex, snapToNearest]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const delta = dragStartX.current - lastPointX.current;
    justFinishedDrag.current = Math.abs(delta) > CLICK_THRESHOLD;

    animateTo(resolveDragTarget());
    setTimeout(() => { justFinishedDrag.current = false; }, 150);
  }, [isDragging, animateTo, resolveDragTarget]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => handleMouseMove(e);
    const onUp = () => handleMouseUp();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ========== TOUCH DRAG (Mobile) ==========
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    isDraggingRef.current = true;
    isHorizontalDrag.current = null;
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    dragStartTranslate.current = translateX.current;
    dragStartTime.current = Date.now();
    lastPointX.current = e.touches[0].clientX;
    setIsDragging(true);
    if (trackRef.current) trackRef.current.style.transition = '';
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(dragStartX.current - currentX);
    const deltaY = Math.abs(dragStartY.current - currentY);

    if (isHorizontalDrag.current === null) {
      if (deltaX < 5 && deltaY < 5) return;

      if (deltaY > deltaX) {
        isHorizontalDrag.current = false;
        isDraggingRef.current = false;
        setIsDragging(false);
        return;
      }
      isHorizontalDrag.current = true;
    }

    if (!isHorizontalDrag.current) return;

    e.preventDefault();
    lastPointX.current = currentX;
    const delta = dragStartX.current - currentX;
    updateTranslate(dragStartTranslate.current - delta);
  }, [updateTranslate]);

  const handleTouchEnd = () => {
    if (!isDraggingRef.current && isHorizontalDrag.current !== true) {
      isDraggingRef.current = false;
      isHorizontalDrag.current = null;
      setIsDragging(false);
      return;
    }
    isDraggingRef.current = false;
    isHorizontalDrag.current = null;
    setIsDragging(false);

    const delta = dragStartX.current - lastPointX.current;
    justFinishedDrag.current = Math.abs(delta) > CLICK_THRESHOLD;

    animateTo(resolveDragTarget());
    setTimeout(() => { justFinishedDrag.current = false; }, 150);
  };

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, handleTouchMove]);

  const handleContainerClick = (e) => {
    if (justFinishedDrag.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="horizontal-scroll-wrapper">
      {!isMobile && canScrollLeft && (
        <button
          className="horizontal-scroll-btn horizontal-scroll-btn-left"
          onClick={(e) => handleScroll('left', e)}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Scroll left"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}

      <div
        className={`horizontal-scroll-viewport ${isDragging ? 'horizontal-scroll-dragging' : ''}`}
        ref={wrapperRef}
        onMouseDown={handleMouseDown}
        onClickCapture={handleContainerClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="horizontal-scroll-track" ref={trackRef}>
          {children}
        </div>
      </div>

      {!isMobile && canScrollRight && (
        <button
          className="horizontal-scroll-btn horizontal-scroll-btn-right"
          onClick={(e) => handleScroll('right', e)}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Scroll right"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
};

export default HorizontalScroll;
