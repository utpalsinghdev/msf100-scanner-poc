import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      }
    >
      <>
        <Toaster position="top-center" />
        <App />
      </>
    </React.Suspense>
  </React.StrictMode>,
)
