import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { assetUrl } from './assetUrl'

document.documentElement.style.setProperty(
  '--nebula',
  `url("${assetUrl('background-image.jpg')}")`,
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
