import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import svgr from 'vite-plugin-svgr'

// GLB/GLTF를 src에서 import하려면 assetsInclude에 추가
export default defineConfig({
  plugins: [react(), glsl(), svgr()],
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],
  server: { port: 5173, open: true }
})
