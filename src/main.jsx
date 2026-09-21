import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ConsentProvider } from './context/ConsentContext.jsx'
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-500-italic.css'
import '@fontsource/jost/latin-300.css'
import '@fontsource/jost/latin-400.css'
import '@fontsource/jost/latin-500.css'
import '@fontsource/jost/latin-600.css'
import '@fontsource/noto-sans-sinhala/sinhala-400.css'
import '@fontsource/noto-sans-sinhala/sinhala-500.css'
import '@fontsource/noto-sans-sinhala/sinhala-600.css'
import '@fontsource/noto-sans-tamil/tamil-400.css'
import '@fontsource/noto-sans-tamil/tamil-500.css'
import '@fontsource/noto-sans-tamil/tamil-600.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConsentProvider>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </ConsentProvider>
    </BrowserRouter>
  </React.StrictMode>
)
