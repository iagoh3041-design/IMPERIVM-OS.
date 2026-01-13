
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

// Registro do Service Worker movido para após o render para não bloquear a UI
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usamos um caminho estritamente relativo para funcionar em subdiretórios do GitHub Pages
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('IMPERIVM: Sistema PWA Online'))
      .catch(err => console.warn('IMPERIVM: Modo Offline indisponível neste ambiente.'));
  });
}
