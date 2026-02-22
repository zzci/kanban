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
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
})

export default config
