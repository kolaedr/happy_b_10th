import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — працює на GitHub Pages під будь-якою назвою репо
export default defineConfig({ base: './', plugins: [react()] })
