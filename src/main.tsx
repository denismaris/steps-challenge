import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode is left out on purpose: it double-runs effects in dev,
// which would play every sound effect twice.
createRoot(document.getElementById('root')!).render(<App />)
