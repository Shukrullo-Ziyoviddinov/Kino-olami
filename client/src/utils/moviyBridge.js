const isEmbedPath = /^\/embed(?:\/|$)/.test(window.location.pathname);
const hostOrigins = (process.env.REACT_APP_MOVIYAI_ORIGINS ||
  'https://moviyai.uz,https://www.moviyai.uz,http://localhost:3000')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
const isWebFrame = window.parent !== window;
const isNative = !isWebFrame && Boolean(window.ReactNativeWebView);
export const usesMoviySession = isEmbedPath && (isNative || isWebFrame);

export function sendMoviyMessage(message) {
  if (!usesMoviySession) return;
  if (isNative) window.ReactNativeWebView.postMessage(JSON.stringify(message));
  else hostOrigins.forEach((origin) => window.parent.postMessage(message, origin));
}

export function listenToMoviyHost(receive) {
  function onMessage(event) {
    if (event.source === window.parent && hostOrigins.includes(event.origin)) receive(event.data);
  }
  function onNative(event) {
    receive(event.detail);
  }
  if (isNative) window.addEventListener('kino-olami:host', onNative);
  else window.addEventListener('message', onMessage);
  return () => {
    window.removeEventListener('message', onMessage);
    window.removeEventListener('kino-olami:host', onNative);
  };
}
