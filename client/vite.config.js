import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/DonateNOW/",
  plugins: [react(), tailwindcss()],
  server: {
    // In dev, forward API calls to the Express server so no CORS setup is needed.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
})
