import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // 1. Alias para solucionar el error de Recharts y facilitar imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'recharts': 'recharts/umd/Recharts.js' // Solución al error require_isUnsafeProperty
    }
  },

  // 2. Configuración CSS unificada (sin repetir la propiedad 'css')
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', 
        loadPaths: [path.resolve(__dirname, 'node_modules')],
      },
    },
  },

  // 3. Configuración del Servidor
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  
  optimizeDeps: {
    force: true, // Esto obliga a Vite a regenerar las dependencias al arrancar
    include: ['react', 'react-dom', 'react-bootstrap', 'recharts'] // Lista explícitamente las librerías pesadas
  },
})