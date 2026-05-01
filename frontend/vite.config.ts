import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  envDir: '.',
  server: {
    port: 5173,
    // HTTPS solo in development locale, non su Vercel
    ...(process.env.NODE_ENV !== 'production' && fs.existsSync(path.resolve(__dirname, '../backend/ssl/key.pem')) ? {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, '../backend/ssl/key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, '../backend/ssl/cert.pem'))
      }
    } : {})
  }
})