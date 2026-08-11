import { getPosts } from '$lib/github';
import type { RequestHandler } from './$types';

export const prerender = true;

const BASE = 'https://ganhammar.se';

type Entry = { url: string; priority: string; changefreq: string; lastmod?: string };

export const GET: RequestHandler = async () => {
	const posts = await getPosts();

	const entries: Entry[] = [
		{ url: '', priority: '1.0', changefreq: 'weekly' },
		{ url: '/about', priority: '0.8', changefreq: 'monthly' },
		...posts.map((post) => ({
			url: `/posts/${post.id}`,
			lastmod: post.date,
			priority: '0.7',
			changefreq: 'monthly'
		}))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(entry) => `  <url>
    <loc>${BASE}${entry.url}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
