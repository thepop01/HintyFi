import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App.tsx';
import { AuthProvider } from '../context/AuthContext.tsx';
import './styles/rainbowkit-custom.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Handle Discord OAuth Redirect for HashRouter
// Detects if we are at root with access_token (standard implicit grant redirect)
if (window.location.hash.includes('access_token=') && !window.location.hash.includes('#/')) {
  // Convert http://domain/#access_token=... to http://domain/#/auth/callback?access_token=...
  const params = window.location.hash.substring(1); // remove '#'
  // Redirect to the auth callback route with params as query string
  window.location.hash = `/auth/callback?${params}`;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(registrationError => {
      console.log('ServiceWorker registration failed: ', registrationError);
    });
  });
}


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
