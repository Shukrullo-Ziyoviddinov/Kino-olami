import { useEffect } from 'react';

let openModals = 0;

function notifyHost(open) {
  // Keep the message name supported by the deployed MoviyAI frontend.
  const message = { type: 'kino-olami:share-modal', open };
  if (window.self !== window.parent) {
    window.parent.postMessage(message, '*');
  } else {
    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  }
}

export default function useEmbedModalLayer(isOpen) {
  useEffect(() => {
    if (!isOpen || (window.self === window.parent && !window.ReactNativeWebView) ||
        document.documentElement.dataset.kinoLayout !== 'embed') return undefined;

    openModals += 1;
    if (openModals === 1) notifyHost(true);

    return () => {
      openModals -= 1;
      if (openModals === 0) notifyHost(false);
    };
  }, [isOpen]);
}
