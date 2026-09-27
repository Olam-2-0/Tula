import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        calendar: resolve(__dirname, 'calendar/index.html'),
        todo: resolve(__dirname, 'todo/index.html'),
        focus: resolve(__dirname, 'focus/index.html'),
        askOrbit: resolve(__dirname, 'ask-orbit/index.html'),
        pdfScanner: resolve(__dirname, 'pdf-scanner/index.html'),
        wellbeing: resolve(__dirname, 'wellbeing/index.html'),
      }
    }
  }
});
