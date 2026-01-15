import { defineConfig } from 'vite'
// eslint-disable-next-line import/no-nodejs-modules
import path from 'path'
// eslint-disable-next-line import/no-nodejs-modules
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      obsidian: path.resolve(__dirname, 'obsidian-mock.ts'),
    },
  },
  server: {
    port: 3000,
  },
})
