import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import apiService from './services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
console.log('🚀 Iniciando aplicação...');
console.log('📍 API Base URL:', API_BASE_URL);

apiService.healthCheck()
  .then((response) => {
    console.log('✅ Backend está acessível:', response.data);
  })
  .catch((error) => {
    console.error('❌ Backend não está acessível:', {
      message: error.message,
      code: error.code,
      url: API_BASE_URL
    });
    console.warn('⚠️ Verifique se o backend está rodando e se a URL está correta.');
  });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
