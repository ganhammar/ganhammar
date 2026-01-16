import { getAsset } from '$lib/github';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { content, contentType } = await getAsset(params.path);
		return new Response(content, {
			headers: {
				'Content-Type': contentType,
				'Content-Length': content.length.toString(),
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch (e) {
		throw error(404, 'Asset not found');
	}
};
