import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Every route is prerendered at build time, so the deployed artefact is
		// plain files on S3 behind CloudFront. There is no server at request
		// time: no Lambda, no GitHub API call, no markdown parsing per view.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// CloudFront compresses on the fly, so shipping .br/.gz twins to S3
			// would only add objects nothing ever requests.
			precompress: false,
			strict: true
		}),
		// The stylesheet is a few kB, so inlining it into each page removes the
		// one render-blocking request a visitor would otherwise wait on.
		inlineStyleThreshold: 24576,
		prerender: {
			handleHttpError: 'fail',
			handleMissingId: 'fail'
		},
		paths: {
			relative: false
		}
	}
};

export default config;
