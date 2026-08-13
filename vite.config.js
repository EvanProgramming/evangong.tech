import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  build: {
    // WebGL vendor chunks are intentionally lazy and can be large; keep the
    // warning budget above their documented payloads without changing the
    // browser's route-level loading behavior.
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        // Split large vendor libs into separate chunks so they cache
        // independently and don't block the initial route bundle.
        // Vite 8 (rolldown) requires manualChunks as a function.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/three/') || id.includes('\\three\\')) return 'vendor-three';
          if (id.includes('@react-three/rapier')) return 'vendor-rapier';
          if (id.includes('@react-three/drei')) return 'vendor-drei';
          if (id.includes('@react-three/fiber')) return 'vendor-fiber';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'vendor-react';
          if (id.includes('/gsap')) return 'vendor-gsap';
          if (id.includes('/motion')) return 'vendor-motion';
          if (id.includes('/maath')) return 'vendor-maath';
          if (id.includes('/ogl') || id.includes('/gl-matrix') || id.includes('/matter-js') || id.includes('/lenis') || id.includes('/postprocessing')) return 'vendor-utils';
        },
      },
    },
  },
})
