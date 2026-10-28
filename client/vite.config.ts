import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_DEMO builds the static demo (GitHub Pages): relative paths, its own dist folder.
const demo = Boolean(process.env.VITE_DEMO)

export default defineConfig({
  base: demo ? './' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5273',
        changeOrigin: true,
      },
    },
  },
  build: {
    // The production build is served straight out of the API project.
    outDir: demo ? 'dist' : '../server/wwwroot',
    emptyOutDir: true,
  },
})
