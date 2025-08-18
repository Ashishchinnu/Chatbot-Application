// src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { NhostClient } from '@nhost/nhost-js'
import { NhostProvider } from '@nhost/react'
import { NhostApolloProvider } from '@nhost/react-apollo'
import App from './App'
import './index.css'

// Make sure these env vars exist in .env (Vite):
// VITE_NHOST_SUBDOMAIN=qkemmskybfazjkdanixg
// VITE_NHOST_REGION=ap-south-1
const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
})

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NhostApolloProvider>
    </NhostProvider>
  </React.StrictMode>
)