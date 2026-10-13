import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error('VITE_API_URL is not set. Add it to frontend/.env.production (the deployed API URL).')
  }

  return {
    base: process.env.VERCEL ? "/" : "/DonateNOW/",
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "redirect-no-trailing-slash",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/DonateNOW") {
              res.writeHead(301, { Location: "/DonateNOW/" })
              res.end()
              return
            }
            next()
          })
        },
      },
    ],
    server: {
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  }
})
