
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Ativação do Service Worker para transformar em APK com tratamento de erro de origem
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      // Forçamos a resolução do caminho relativo ao origin atual do sandbox
      // Isso resolve o erro: "The origin of the provided scriptURL does not match the current origin"
      const swUrl = new URL('./sw.js', window.location.href).href;
      
      navigator.serviceWorker.register(swUrl)
        .then(reg => console.log('IMPERIVM OS: Service Worker Operacional'))
        .catch(err => {
          // Em ambientes de preview (iframes), o SW pode ser bloqueado por política de segurança
          if (err.name === 'SecurityError' || err.message.includes('origin')) {
             console.warn('IMPERIVM OS: Service Worker em modo passivo (ambiente restrito).');
          } else {
             console.error('IMPERIVM OS: Erro crítico no SW', err);
          }
        });
    } catch (e) {
      console.warn('IMPERIVM OS: Falha ao inicializar subsistema de cache.');
    }
  });
}
