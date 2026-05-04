import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' 

// 1. 👈 استيراد أدوات React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// استيراد السياقات (Providers)
import { AuthProvider } from '../src/context/AuthContext' 
import { NotificationProvider } from '../src/context/NotificationContext' 
import { PrivacyProvider } from '../src/context/PrivacyContext' 

// 2. 👈 إنشاء نسخة (Instance) من QueryClient
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. 👈 تغليف التطبيق بالكامل بـ QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <PrivacyProvider>
              <App />
            </PrivacyProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)