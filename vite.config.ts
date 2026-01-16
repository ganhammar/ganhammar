import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit()],
	ssr: mode === 'production' ? {
		noExternal: ['marked', 'yaml', 'lowlight', 'hast-util-to-html', 'highlight.js']
	} : undefined
}));
