import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SensorProvider } from './context/SensorContext.jsx'
import { SensorProvider1 } from './context/SensorContext1.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SensorProvider>
    <SensorProvider1>
      <App />
    </SensorProvider1>
    </SensorProvider>
  </StrictMode>,
)
