import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Registra o Service Worker do PWA com atualização automática em segundo plano
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do Viva Nutri disponível.');
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
