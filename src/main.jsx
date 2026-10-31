import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'
import { ToastProvider } from './components/common/Toast.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AppProvider>
            <ChatProvider>
              <App />
            </ChatProvider>
          </AppProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
