import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    cors: false,      // block cross-origin requests to dev server (mitigates GHSA-67mh-4wv8-2f99)
    hmr: { host: 'localhost' },  // lock HMR WebSocket to localhost only
  },
  preview: {
    cors: false,
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
