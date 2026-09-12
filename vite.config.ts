import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/dashboard-transporte-front/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
})
