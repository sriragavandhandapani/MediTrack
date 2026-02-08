mport { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // Ensures correct asset loading
  build: {
    outDir: 'dist',  // Ensures output directory is correct
  }
})