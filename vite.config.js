import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const distFile = (path) => fileURLToPath(new URL(path, import.meta.url))

// GitHub Pages no sirve rutas del SPA: copia index.html a 404.html como fallback
const spaFallback = () => ({
  name: 'spa-fallback-404',
  apply: 'build',
  closeBundle() {
    copyFileSync(distFile('dist/index.html'), distFile('dist/404.html'))
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: '/dbz_ttt_mods_git/',
  plugins: [react(), spaFallback()],
})
