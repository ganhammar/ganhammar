import { getPost } from '$lib/github';
import { parseMarkdown } from '$lib/markdown';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const { content } = await getPost(params.slug);
		const parsed = await parseMarkdown(content);

		// Calculate reading time (avg 200 words per minute)
		const wordCount = parsed.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
		const readingTime = Math.ceil(wordCount / 200);

		return {
			id: parsed.id,
			title: parsed.title,
			description: parsed.description,
			date: parsed.date,
			publishedTime: new Date(parsed.date).toISOString(),
			readingTime,
			content: parsed.content
		};
	} catch (e) {
		throw error(404, 'Post not found');
	}
};
