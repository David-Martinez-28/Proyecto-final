// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// src/main.jsx
import 'bootstrap/dist/css/bootstrap.min.css'; // <--- ESTO ES OBLIGATORIO
import './assets/scss/main.scss'; // Tus estilos personalizados van después

// Importación estándar de SASS
import './assets/scss/main.scss' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)