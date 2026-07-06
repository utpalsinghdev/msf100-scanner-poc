import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense
      fallback={
        <div className="app-mesh-bg flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
              <div className="absolute inset-1.5 animate-spin rounded-full border-2 border-transparent border-b-indigo-400 [animation-direction:reverse] [animation-duration:1.2s]" />
            </div>
            <p className="text-sm font-medium text-slate-500">Loading…</p>
          </div>
        </div>
      }
    >
      <>
        <Toaster
          position="top-center"
          gutter={12}
          toastOptions={{
            duration: 3500,
            className: '!rounded-xl !border !border-slate-200/80 !bg-white/95 !text-sm !font-medium !text-slate-800 !shadow-lift !backdrop-blur-sm',
            success: {
              iconTheme: { primary: '#4f46e5', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <App />
      </>
    </React.Suspense>
  </React.StrictMode>,
)
