import { getAllSlugs, getAssetNames, getAssetSizes, getPosts, getPostSource } from '$lib/github';
import { SITE_URL } from '$lib/site';
import { parseMarkdown } from '$lib/markdown';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

// Every slug is written to disk at build time, drafts included, so a draft can
// be opened by anyone who has the URL. What keeps it unpublished is that it is
// absent from the index, the sitemap and the feed, and that the page tells
// crawlers not to index it.
export const entries: EntryGenerator = async () => {
	const slugs = await getAllSlugs();
	return slugs.map((slug) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	let source: string;
	try {
		source = await getPostSource(params.slug);
	} catch {
		error(404, 'Post not found');
	}

	const parsed = parseMarkdown(source, {
		assetSizes: await getAssetSizes(),
		assetNames: new Set(await getAssetNames())
	});

	const draft = parsed.status !== 'published';

	// Published posts are numbered and linked to their neighbours. A draft has
	// neither: it has not taken a number yet, and it should not appear in the
	// walk through the archive.
	const posts = draft ? [] : await getPosts();
	const index = posts.findIndex((post) => post.id === params.slug);
	const newer = index > 0 ? posts[index - 1] : undefined;
	const older = index >= 0 ? posts[index + 1] : undefined;

	// A cover may be an absolute URL or an asset path; Open Graph needs it
	// absolute either way.
	const cover = parsed.cover
		? /^https?:\/\//.test(parsed.cover)
			? parsed.cover
			: `${SITE_URL}/posts/assets/${parsed.cover.replace(/^\.\/assets\//, '').replace(/^assets\//, '')}`
		: undefined;

	return {
		id: parsed.id || params.slug,
		entry: index >= 0 ? posts[index].entry : null,
		draft,
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
