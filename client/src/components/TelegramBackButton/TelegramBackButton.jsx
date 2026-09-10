import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function getTelegramWebApp() {
  const tg = window?.Telegram?.WebApp;
  if (!tg?.BackButton) return null;

  const isTelegramClient =
    /Telegram/i.test(window.navigator?.userAgent || '') ||
    Boolean(tg.initData);

  return isTelegramClient ? tg : null;
}

/** Oxirgi ochiq modal (watch, search, …) Telegram ← bilan yopiladi */
const overlayCloseStack = [];

function syncTelegramBackVisibility() {
  const tg = getTelegramWebApp();
  if (!tg?.BackButton) return;

  const path = window.location.pathname;
  if (overlayCloseStack.length > 0 || path !== '/') {
    tg.BackButton.show();
  } else {
    tg.BackButton.hide();
  }
}

export function pushTelegramOverlayClose(handler) {
  if (typeof handler !== 'function') return;
  overlayCloseStack.push(handler);
  syncTelegramBackVisibility();
}

export function popTelegramOverlayClose(handler) {
  const i = overlayCloseStack.lastIndexOf(handler);
  if (i >= 0) overlayCloseStack.splice(i, 1);
  syncTelegramBackVisibility();
}

/** @deprecated WatchModal — pushTelegramOverlayClose ishlating */
export function setTelegramWatchModalClose(handler) {
  if (typeof handler === 'function') {
    pushTelegramOverlayClose(handler);
  } else if (overlayCloseStack.length) {
    overlayCloseStack.pop();
    syncTelegramBackVisibility();
  }
}

/**
 * Telegram Mini App yuqori ← BackButton:
 * "/" da yashirin (faqat X), boshqa route'larda ko'rinadi.
 * Modal (watch / search) ochiq bo‘lsa — faqat modal yopiladi.
 */
function TelegramBackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return undefined;

    const backButton = tg.BackButton;

    const handleBack = () => {
      if (overlayCloseStack.length > 0) {
        overlayCloseStack[overlayCloseStack.length - 1]();
        return;
      }
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    };

    syncTelegramBackVisibility();

    if (typeof backButton.onClick === 'function') {
      backButton.onClick(handleBack);
    }

    return () => {
      if (typeof backButton.offClick === 'function') {
        backButton.offClick(handleBack);
      }
      backButton.hide();
    };
  }, [location.pathname, navigate]);

  return null;
}

export default TelegramBackButton;
export { getTelegramWebApp };
