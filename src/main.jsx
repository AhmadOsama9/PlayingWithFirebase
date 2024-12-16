import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FirebaseMessagingProvider } from './context/FirebaseMessagingContext.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthContextProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthContextProvider>
        <FirebaseMessagingProvider>
          <App />
        </FirebaseMessagingProvider>
      </AuthContextProvider>
    </Router>
  </StrictMode>,
)
