


import React, { useRef, useEffect } from 'react';
import './ScrollTouch.css';

const ScrollTouch = ({ children, className = '', ...props }) => {
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleMouseDown = (e) => {
      isDown.current = true;
      hasDragged.current = false;
      element.style.cursor = 'grabbing';
      startX.current = e.pageX - element.offsetLeft;
      scrollLeft.current = element.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown.current = false;
      element.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDown.current = false;
      element.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDown.current) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX.current) * 2;
      if (Math.abs(walk) > 3) hasDragged.current = true;
      element.scrollLeft = scrollLeft.current - walk;
    };

    const handleClick = (e) => {
      if (hasDragged.current) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged.current = false;
      }
    };

    // Touch events
    let touchStartX = 0;
    let touchStartY = 0; // ← YANGI: vertikal yo'nalish uchun
    let touchScrollLeft = 0;
    let isTouching = false;
    let isHorizontal = null; // ← YANGI: null = aniqlanmagan, true/false = yo'nalish

    const handleTouchStart = (e) => {
      isTouching = true;
      isHorizontal = null; // ← har safar reset
      hasDragged.current = false;
      touchStartX = e.touches[0].pageX - element.offsetLeft;
      touchStartY = e.touches[0].clientY; // ← Y koordinatani saqlash
      touchScrollLeft = element.scrollLeft;
    };

    const handleTouchMove = (e) => {
      if (!isTouching) return;

      const currentX = e.touches[0].pageX - element.offsetLeft;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - touchStartX);
      const deltaY = Math.abs(currentY - touchStartY);

      // Yo'nalishni birinchi marta aniqlash
      if (isHorizontal === null) {
        if (deltaX < 5 && deltaY < 5) return; // hali aniqlab bo'lmaydi

        if (deltaY > deltaX) {
          // Vertikal scroll — brauzerga qo'yib ber
          isHorizontal = false;
          isTouching = false;
          return;
        } else {
          // Gorizontal drag — biz boshqaramiz
          isHorizontal = true;
        }
      }

      if (!isHorizontal) return;

      e.preventDefault(); // ← faqat gorizontal bo'lsa bloklash
      const walk = (currentX - touchStartX) * 2;
      if (Math.abs(walk) > 3) hasDragged.current = true;
      element.scrollLeft = touchScrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isTouching = false;
      isHorizontal = null;
    };

    // Event listeners
    element.addEventListener('click', handleClick, true);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('touchstart', handleTouchStart, { passive: true }); // ← passive: true (preventDefault shart emas)
    element.addEventListener('touchmove', handleTouchMove, { passive: false }); // ← passive: false (gorizontalda preventDefault kerak)
    element.addEventListener('touchend', handleTouchEnd);

    element.style.cursor = 'grab';

    return () => {
      element.removeEventListener('click', handleClick, true);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`scroll-touch ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ScrollTouch;