import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// PWA support for installable-web testing only — skipped entirely once this ships inside a
// Capacitor shell (Capacitor injects `window.Capacitor`), where a service worker would be
// redundant at best and is explicitly out of scope (see README's Capacitor section).
if ('serviceWorker' in navigator && import.meta.env.PROD && !(window as unknown as { Capacitor?: unknown }).Capacitor) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is a nice-to-have, not a requirement — fail silently.
    });
  });
}
