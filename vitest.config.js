import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest config — separate from vite.config.js so the production build stays
// unaffected. Uses jsdom (DOM APIs for component testing) and the React plugin
// for JSX transform. setup.js wires @testing-library/jest-dom matchers.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    testTimeout: 10000,
  },
})
