import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      'obsidian': path.resolve(__dirname, 'obsidian-mock.ts'),
    },
  },
  server: {
    port: 3000,
  }
})
