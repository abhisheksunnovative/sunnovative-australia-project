import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: "/",   // 👈 THIS IS REQUIRED
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Emergesun EPC Portal',
        short_name: 'Emergesun EPC',
        description: 'Emergesun Solar Installer & EPC Web App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo.png', // Fallback
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png', // Fallback
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})