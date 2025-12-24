import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Modal from 'react-modal'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';

// Set the app element for react-modal accessibility
Modal.setAppElement('#root')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
