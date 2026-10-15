import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { version } from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // A versão exibida na interface vem do package.json, pra não ficar defasada
  // a cada release (ficou em "v1.0" até a 1.3.0 por ser escrita na mão).
  define: {
    APP_VERSION: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/components/ui/**',
        'src/**/*.d.ts',
        'src/test/**',
      ],
      thresholds: {
        statements: 70,
        lines: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
})
