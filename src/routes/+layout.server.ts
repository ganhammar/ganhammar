import { getPosts } from '$lib/github';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const posts = await getPosts();

	// The colophon states facts about the archive, so they are counted from it
	// rather than written down anywhere that could drift.
	return {
		colophon: {
			entries: posts.length,
			since: posts.at(-1)?.date.slice(0, 4) ?? '',
			updated: posts[0]?.date ?? ''
		}
	};
};
