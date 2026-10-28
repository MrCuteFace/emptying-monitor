import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// The public demo has no back end: the simulation runs in the browser instead.
if (import.meta.env.VITE_DEMO) {
  const { installMockServer } = await import('./api/mock/server')
  installMockServer()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
