import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  // GitHub Pages only serves static files, so a production build must know where the API lives.
  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error('VITE_API_URL is not set. Add it to client/.env.production (the deployed API URL).')
  }

  return {
    base: "/DonateNOW/",
    plugins: [react(), tailwindcss()],
    server: {
      // In dev, forward API calls to the Express server so no CORS setup is needed.
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  }
})
