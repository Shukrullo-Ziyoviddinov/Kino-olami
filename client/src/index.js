import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App, { isEmbed } from './App';
import './i18n';

function renderApp() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (isEmbed) {
  renderApp();
} else {
  // Standalone Telegram controls expect the SDK when the app mounts.
  const telegramScript = document.createElement('script');
  telegramScript.src = 'https://telegram.org/js/telegram-web-app.js';
  telegramScript.addEventListener('load', renderApp, { once: true });
  telegramScript.addEventListener('error', renderApp, { once: true });
  document.head.append(telegramScript);
}
