import { defineConfig } from "vite";
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro({ preset: "vercel" }),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'],
      manifest: {
        name: 'KcalTrack',
        short_name: 'KcalTrack',
        description: 'Controle Inteligente de Calorias',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
});
