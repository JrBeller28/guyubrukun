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
          <div className="gr-startup-fallback min-h-screen w-full flex flex-col items-center justify-center" role="status" aria-label="Memuat Guyub Rukun">
            <div className="gr-startup-fallback-logo">
              <img src="/splash-logo.png" alt="Logo Guyub Rukun" fetchPriority="high" />
            </div>
            <p className="mt-4 text-xs font-semibold text-teal-800">Memuat Guyub Rukun...</p>
            <div className="gr-startup-fallback-track mt-4" aria-hidden="true"><span /></div>
          </div>
        }>
          <App />
        </Suspense>
      </DashboardProvider>
    </ErrorBoundary>
  </StrictMode>,
);


