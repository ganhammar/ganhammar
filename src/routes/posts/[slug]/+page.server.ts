import { getAssetNames, getAssetSizes, getPosts, getPostSource } from '$lib/github';
import { SITE_URL } from '$lib/site';
import { parseMarkdown } from '$lib/markdown';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

// Tells the prerenderer which slugs exist, so every post is written to disk at
// build time instead of being resolved on request.
export const entries: EntryGenerator = async () => {
	const posts = await getPosts();
	return posts.map((post) => ({ slug: post.id }));
};

export const load: PageServerLoad = async ({ params }) => {
	const posts = await getPosts();
	const index = posts.findIndex((post) => post.id === params.slug);

	if (index === -1) {
		error(404, 'Post not found');
	}

	const parsed = parseMarkdown(await getPostSource(params.slug), {
		assetSizes: await getAssetSizes(),
		assetNames: new Set(await getAssetNames())
	});

	// A cover may be an absolute URL or an asset path; Open Graph needs it
	// absolute either way.
	const cover = parsed.cover
		? /^https?:\/\//.test(parsed.cover)
			? parsed.cover
			: `${SITE_URL}/posts/assets/${parsed.cover.replace(/^\.\/assets\//, '').replace(/^assets\//, '')}`
		: undefined;

	// posts is newest-first, so the entry after this one in the array is older.
	const newer = posts[index - 1];
	const older = posts[index + 1];

	return {
		id: posts[index].id,
		entry: posts[index].entry,
		title: parsed.title,
		description: parsed.description,
		date: parsed.date,
		publishedTime: new Date(parsed.date).toISOString(),
		readingTime: parsed.readingTime,
		canonical: parsed.canonical,
		cover,
		headings: parsed.headings,
		content: parsed.content,
		newer: newer ? { id: newer.id, title: newer.title } : null,
		older: older ? { id: older.id, title: older.title } : null
	};
};
