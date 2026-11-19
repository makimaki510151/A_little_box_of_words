import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: set base to '/<repo-name>/' when deploying
export default defineConfig({
  plugins: [react()],
  base: './',
})
