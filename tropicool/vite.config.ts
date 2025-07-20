import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import svgLoader from 'vite-svg-loader'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement depuis la racine du projet
  const env = loadEnv(mode, '../', '')
  
  return {
    plugins: [
      vue(),
      svgLoader(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      watch: {
        usePolling: true
      }
    },
    // Exposer les variables d'environnement au frontend
    define: {
      'process.env': env
    }
  }
})