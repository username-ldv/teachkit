import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { shikiPreprocess } from './tools/shiki-preprocess.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [shikiPreprocess(), vitePreprocess()],
  kit: {
    adapter: adapter({ pages: 'dist', assets: 'dist', fallback: undefined, precompress: false, strict: true }),
    alias: { $diagrams: 'src/lib/diagrams' },
    prerender: { handleMissingId: 'warn' }
  }
};

export default config;
