import { getAsset, getAssetNames } from '$lib/github';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

// Prerendered like everything else: each image is pulled from the posts repo
// once at build time and written into the deployed bundle, so it is served
// straight from the CDN rather than proxied on every view.
export const entries: EntryGenerator = async () => {
	const names = await getAssetNames();
	return names.map((name) => ({ path: name }));
};

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { body, contentType } = await getAsset(params.path);
		return new Response(body, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		error(404, 'Asset not found');
	}
};
