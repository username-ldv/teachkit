import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { katexFonts } from './tools/katex-fonts.js';

export default defineConfig({
  plugins: [katexFonts(), tailwindcss(), sveltekit()],
  server: { host: '127.0.0.1', fs: { allow: ['.'] } }
});
