import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Birden fazla React instance'ının yüklenmesini engelle
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
})
