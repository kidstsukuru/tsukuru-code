import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3001,
      hmr: {
        host: 'localhost',
        protocol: 'ws',
        overlay: true,
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.svg', 'robots.txt', 'icon-180x180.png'],
        manifest: {
          name: 'つくるコード - Tsukuru Code',
          short_name: 'つくるコード',
          description: 'ゲームみたいに楽しく学ぶ、子供向けプログラミング学習プラットフォーム',
          theme_color: '#f59e0b',
          background_color: '#fffbeb',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'ja',
          dir: 'ltr',
          categories: ['education', 'kids', 'programming'],
          screenshots: [
            {
              src: '/screenshot-wide.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'ダッシュボード画面'
            },
            {
              src: '/screenshot-mobile.png',
              sizes: '750x1334',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'モバイル画面'
            }
          ],
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icon-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ],
          shortcuts: [
            {
              name: 'ダッシュボード',
              short_name: 'ダッシュボード',
              description: 'ダッシュボードを開く',
              url: '/dashboard',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'クリエイターズワールド',
              short_name: '作品',
              description: 'みんなの作品を見る',
              url: '/creations',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 // 1日
                },
                networkTimeoutSeconds: 10
              }
            }
          ]
        },
        devOptions: {
          enabled: false  // 開発環境ではPWAを無効化（CORSエラー防止）
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'react-hot-toast'],
    },
    build: {
      rollupOptions: {
        output: {
          // manualChunks configuration removed to prevent chunk loading issues
        },
      },
      // チャンクサイズ警告の閾値を上げる（最適化後は不要になるはず）
      chunkSizeWarningLimit: 600,
    },
  };
});
