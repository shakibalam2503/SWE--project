// Global fetch interceptor to handle JWT access token expiration & automatic refresh
const originalFetch = window.fetch;
let refreshPromise = null;

window.fetch = async function (url, options) {
    let response = await originalFetch(url, options);

    const urlStr = typeof url === 'string' 
        ? url 
        : (url instanceof Request ? url.url : (url instanceof URL ? url.href : ''));
    const isAuthRoute = urlStr.includes('/api/auth/login') || 
                        urlStr.includes('/api/auth/refresh') || 
                        urlStr.includes('/api/auth/logout') || 
                        urlStr.includes('/api/auth/register');

    if (response.status === 401 && !isAuthRoute) {
        if (!refreshPromise) {
            refreshPromise = originalFetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }).then(async (res) => {
                refreshPromise = null;
                if (!res.ok) {
                    throw new Error('Session expired');
                }
                return res;
            }).catch((err) => {
                refreshPromise = null;
                throw err;
            });
        }

        try {
            await refreshPromise;
            // Retry the original request
            response = await originalFetch(url, options);
        } catch (err) {
            console.error("Token refresh failed:", err);
            // Notify AuthProvider to log the user out
            window.dispatchEvent(new CustomEvent('auth-failed'));
        }
    }

    return response;
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/auth/auth.context'
import { ChatProvider } from './features/chat/chat.context'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
