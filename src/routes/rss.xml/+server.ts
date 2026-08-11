import { getPosts, getPostSource } from '$lib/github';
import { parseMarkdown } from '$lib/markdown';
import type { RequestHandler } from './$types';

export const prerender = true;

const BASE = 'https://ganhammar.se';

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async () => {
	const posts = await getPosts();

	const items = await Promise.all(
		posts.map(async (post) => {
			const { description } = parseMarkdown(await getPostSource(post.id));
			return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE}/posts/${post.id}</link>
      <guid isPermaLink="true">${BASE}/posts/${post.id}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
		})
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ganhammar</title>
    <link>${BASE}</link>
    <description>Notes on serverless, .NET, and whatever I have just taken apart.</description>
    <language>en</language>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
