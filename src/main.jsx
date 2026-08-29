import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Garante limpeza de caches antigos no navegador
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.update();
    }
  });
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do Viva Nutri detectada. Atualizando página...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('Viva Nutri pronto para funcionar offline.');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
