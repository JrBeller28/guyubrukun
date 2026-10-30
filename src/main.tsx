import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { DashboardProvider } from './DashboardContext.tsx';
import './index.css';

// Gracefully handle and ignore benign Vite WebSocket/HMR disconnect errors in sandboxed environments
if (typeof window !== 'undefined') {
  const origConsoleError = console.error;
  console.error = (...args: any[]) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (
      firstArg.includes('[vite]') &&
      (firstArg.includes('websocket') || firstArg.includes('WebSocket') || firstArg.includes('hmr') || firstArg.includes('HMR'))
    ) {
      return;
    }
    origConsoleError.apply(console, args);
  };

  if ('serviceWorker' in navigator && (import.meta as any).env?.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  }

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || '';
    const reasonStr = typeof reason === 'string' ? reason : (reason.message || '');
    if (
      reasonStr.includes('WebSocket') || 
      reasonStr.includes('vite') || 
      reasonStr.includes('ws://') || 
      reasonStr.includes('wss://')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') || 
      msg.includes('vite') || 
      msg.includes('ws://') || 
      msg.includes('wss://')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Suspense } from 'react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <DashboardProvider>
        <Suspense fallback={
          <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 text-teal-600">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-500">Memuat Guyub Rukun...</p>
            </div>
          </div>
        }>
          <App />
        </Suspense>
      </DashboardProvider>
    </ErrorBoundary>
  </StrictMode>,
);


