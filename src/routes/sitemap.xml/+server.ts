import { getPosts } from '$lib/github';
import type { RequestHandler } from './$types';

type SitemapEntry = {
	url: string;
	priority: string;
	changefreq: string;
	lastmod?: string;
};

export const GET: RequestHandler = async () => {
	const posts = await getPosts();
	const baseUrl = 'https://ganhammar.se';

	const staticPages: SitemapEntry[] = [
		{ url: '', priority: '1.0', changefreq: 'weekly' },
		{ url: '/about', priority: '0.8', changefreq: 'monthly' }
	];

	const postEntries: SitemapEntry[] = posts.map((post) => ({
		url: `/posts/${post.id}`,
		lastmod: post.date,
		priority: '0.7',
		changefreq: 'monthly'
	}));

	const allEntries: SitemapEntry[] = [...staticPages, ...postEntries];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
	.map(
		(entry) => `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
