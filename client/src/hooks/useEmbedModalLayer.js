import { useEffect } from 'react';

let openModals = 0;

function notifyHost(open) {
  // Keep the message name supported by the deployed MoviyAI frontend.
  window.parent.postMessage({ type: 'kino-olami:share-modal', open }, '*');
}

export default function useEmbedModalLayer(isOpen) {
  useEffect(() => {
    if (!isOpen || window.self === window.parent ||
        document.documentElement.dataset.kinoLayout !== 'embed') return undefined;

    openModals += 1;
    if (openModals === 1) notifyHost(true);

    return () => {
      openModals -= 1;
      if (openModals === 0) notifyHost(false);
    };
  }, [isOpen]);
}
