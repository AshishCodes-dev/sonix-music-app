import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { handleGoogleRedirect } from './lib/googleAuth'

handleGoogleRedirect();

// Register the service worker for PWA install. Force-update so users always get
// the newest build (no stale cache).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update();
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (nw) {
          nw.addEventListener('statechange', () => {
            // A new SW took control — reload once to load fresh assets.
            if (nw.state === 'activated' && navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
        }
      });
    }).catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
