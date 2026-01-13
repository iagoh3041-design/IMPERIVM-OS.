
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Função para inicializar o sistema
const bootstrap = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("IMPERIVM: Interface montada com sucesso.");
  } else {
    console.error("IMPERIVM: Falha crítica - Container 'root' não encontrado.");
  }
};

// Executa a montagem
bootstrap();

// Registro do Service Worker em segundo plano
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(() => console.log('IMPERIVM: Núcleo PWA ativo.'))
      .catch(err => console.log('IMPERIVM: Offline bypass.'));
  });
}
