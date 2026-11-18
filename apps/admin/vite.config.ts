import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// An EMPTY (but defined) VITE_API_URL is baked into the bundle as "", so every API call goes to the admin's own address and
// login fails with no clear error. Deploy tools (Coolify) pass empty values for variables that were never filled in, so
// refuse to build instead of shipping that. An unset variable is fine: the localhost default applies.
function assertApiUrlNotEmpty(command: string) {
  const value = process.env.VITE_API_URL
  if (command === 'build' && value !== undefined && value.trim() === '') {
    throw new Error(
      'VITE_API_URL is set but empty. Give it the public https address of the API (for example https://api.example.com) ' +
        'in the environment variables of this deployment, then build again.'
    )
  }
}

export default defineConfig(({ command }) => {
  assertApiUrlNotEmpty(command)
  return {
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3002,
    host: true,
    strictPort: true,
    proxy: {
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/public': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}
})
