import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PediCalc SW registered successfully:', registration.scope)
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      })
      .catch((error) => {
        console.log('PediCalc SW registration failed:', error)
      })
  })
}

// Install prompt for PWA
let deferredPrompt: any = null

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  
  // Show install button/banner after a delay
  setTimeout(() => {
    const shouldShowInstall = !window.matchMedia('(display-mode: standalone)').matches
    if (shouldShowInstall && deferredPrompt) {
      // You can show your own install UI here
      console.log('PWA install available')
    }
  }, 3000)
})

window.addEventListener('appinstalled', () => {
  console.log('PediCalc PWA was installed')
  deferredPrompt = null
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
