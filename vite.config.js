import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cambiá 'academia-lr' por el nombre exacto de tu repositorio en GitHub
export default defineConfig({
  plugins: [react()],
  base: '/academia-lr/',
})
