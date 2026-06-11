// vite.config.js
import { defineConfig } from 'vite'
import react           from '@vitejs/plugin-react'
import { VitePWA }     from 'vite-plugin-pwa'

export default defineConfig({
  // Base para GitHub Pages: https://academialuchorolandopadel.github.io/academia-lr/
  base: '/academia-lr/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],

      // ── Manifest (identidad de la app instalada) ─────────────────────────
      manifest: {
        name:             'Academia LR',
        short_name:       'AcademiaLR',
        description:      'Academia de Padel · Lucho Rolando',
        theme_color:      '#0f1a2e',
        background_color: '#0f1a2e',
        display:          'standalone',   // ← se ve como app nativa (sin barra del browser)
        orientation:      'portrait',
        scope:            '/academia-lr/',
        start_url:        '/academia-lr/',
        icons: [
          { src: 'pwa-192x192.png',  sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',  sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png',  sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
        ],
      },

      // ── Service Worker (caché offline) ───────────────────────────────────
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Caché de llamadas a Firestore (1 hora)
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler:    'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
})
