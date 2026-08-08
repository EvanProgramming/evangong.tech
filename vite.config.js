import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  build: {
    rollupOptions: {
      output: {
        // Split large vendor libs into separate chunks so they cache
        // independently and don't block the initial route bundle.
        // Vite 8 (rolldown) requires manualChunks as a function.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/three/') || id.includes('\\three\\')) return 'vendor-three';
          if (id.includes('@react-three/')) return 'vendor-r3f';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'vendor-react';
          if (id.includes('/gsap') || id.includes('/motion') || id.includes('/maath')) return 'vendor-anim';
          if (id.includes('/ogl') || id.includes('/gl-matrix') || id.includes('/matter-js') || id.includes('/lenis') || id.includes('/postprocessing')) return 'vendor-utils';
        },
      },
    },
  },
})
