import { useCallback, useEffect, useRef, useState } from 'react';

/** Cache’dan kelgan rasm allaqachon tayyorligini tekshiradi. */
export const isHtmlImageReady = (img) =>
  Boolean(img && img.complete && img.naturalWidth > 0);

/**
 * <img> yuklash holati. Cache’da bo‘lsa skeleton darhol yopiladi;
 * onLoad effect’dan oldin o‘tsa ham complete tekshiruvi tuzatadi.
 */
export const useImageLoadState = (src) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(() => !src);

  useEffect(() => {
    if (!src) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    const img = imgRef.current;
    if (isHtmlImageReady(img)) {
      setIsLoaded(true);
    }
  }, [src]);

  const markLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return {
    imgRef,
    showLoading: Boolean(src) && !isLoaded,
    onLoad: markLoaded,
    onError: markLoaded,
  };
};
