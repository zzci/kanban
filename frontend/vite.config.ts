import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import tsconfigPaths from 'vite-tsconfig-paths'
import devServer, { defaultOptions } from '@hono/vite-dev-server'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    viteReact(),
    devServer({
      entry: resolve(__dirname, '../app/app.ts'),
      exclude: [...defaultOptions.exclude, /^(?!\/api(?:\/|$)).*/],
      injectClientScript: false,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          const m = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)
          if (!m) return undefined
          const pkg = m[1]
          if (pkg === 'react' || pkg === 'scheduler') return 'vendor-react'
          if (pkg === 'react-dom') return 'vendor-react-dom'
          if (pkg === 'react-router' || pkg === 'react-router-dom')
            return 'vendor-router'
          if (pkg === '@tanstack/react-query') return 'vendor-query'
          if (pkg.startsWith('@dnd-kit/')) return 'vendor-dnd'
          if (pkg.startsWith('@radix-ui/') || pkg === 'lucide-react')
            return 'vendor-ui'
          if (pkg === 'i18next' || pkg === 'react-i18next') return 'vendor-i18n'
          if (
            pkg === 'tailwind-merge' ||
            pkg === 'clsx' ||
            pkg === 'class-variance-authority'
          )
            return 'vendor-style'
          if (pkg === 'zustand') return 'vendor-state'
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
})

export default config
