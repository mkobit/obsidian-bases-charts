import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'obsidian': resolve(__dirname, 'obsidian-mock.ts'),
    },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['../..'],
    },
  },
});
