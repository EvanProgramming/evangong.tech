import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [
    react(),
    // Build-time image transforms via sharp. Query-driven: imports opt in with
    // e.g. `?w=640&format=webp`. public/ is excluded by default (mirroring
    // Vite), so images that need transforming must live under src/ or root.
    imagetools()
  ],
  assetsInclude: ['**/*.glb'],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split stable vendor libs into independently-cached chunks so the
        // heavy 3D stack doesn't bloat the initial app chunk and can be
        // fetched in parallel + cached across deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // R3F ecosystem (check first so @react-three isn't caught by /three/)
          if (
            id.includes('/@react-three/fiber/') ||
            id.includes('/@react-three/drei/') ||
            id.includes('/@react-three/rapier/') ||
            id.includes('/@dimforge/')
          ) {
            return 'vendor-r3f'
          }
          if (
            id.includes('/three/') ||
            id.includes('/postprocessing/') ||
            id.includes('/meshline/') ||
            id.includes('/maath/')
          ) {
            return 'vendor-three'
          }
          if (id.includes('/gsap/') || id.includes('/@gsap/')) {
            return 'vendor-gsap'
          }
          if (id.includes('/motion/')) {
            return 'vendor-motion'
          }
          if (id.includes('/ogl/')) {
            return 'vendor-ogl'
          }
          if (id.includes('/lenis/')) {
            return 'vendor-lenis'
          }
        }
      }
    }
  }
})
