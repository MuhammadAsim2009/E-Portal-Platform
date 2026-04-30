import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Reload triggered for date-fns
export default defineConfig({
  plugins: [react()],
})
