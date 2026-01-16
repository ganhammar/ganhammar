import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import { common, createLowlight } from 'lowlight';
import { toHtml } from 'hast-util-to-html';

const lowlight = createLowlight(common);

export type ParsedPost = {
	title: string;
	id: string;
	date: string;
	status: string;
	description: string;
	content: string;
};

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) {
		return { data: {}, content: raw };
	}
	const data = parseYaml(match[1]) as Record<string, unknown>;
	return { data, content: match[2] };
}

function generateExcerpt(markdown: string, length: number = 155): string {
	return markdown
		.replace(/^#+\s.*/gm, '') // Remove headings
		.replace(/[*_~`]/g, '') // Remove markdown formatting
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
		.replace(/```[\s\S]*?```/g, '') // Remove code blocks
		.replace(/\n+/g, ' ') // Replace newlines with spaces
		.trim()
		.substring(0, length)
		.trim() + '...';
}

export async function parseMarkdown(raw: string): Promise<ParsedPost> {
	const { data, content } = parseFrontmatter(raw);

	const marked = new Marked({
		async: true,
		gfm: true
	});

	marked.use({
		renderer: {
			code({ text, lang }) {
				try {
					const tree = lang && lowlight.registered(lang)
						? lowlight.highlight(lang, text)
						: lowlight.highlightAuto(text);
					const html = toHtml(tree);
					return `<pre><code class="hljs${lang ? ` language-${lang}` : ''}">${html}</code></pre>`;
				} catch {
					return `<pre><code class="hljs${lang ? ` language-${lang}` : ''}">${escapeHtml(text)}</code></pre>`;
				}
			},
			image({ href, title, text }) {
				// Rewrite relative image URLs to use the asset proxy
				let src = href;
				if (href && !href.startsWith('http') && !href.startsWith('/')) {
					src = `/posts/assets/${href}`;
				}
				const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
				return `<img src="${src}" alt="${escapeHtml(text || '')}"${titleAttr} />`;
			}
		}
	});

	const html = await marked.parse(content);

	// Use frontmatter description if provided, otherwise generate from content
	const description = (data.description as string) || generateExcerpt(content);

	return {
		title: (data.title as string)?.replace(/^"|"$/g, '') || '',
		id: (data.id as string) || '',
		date: (data.date as string) || '',
		status: (data.status as string) || 'draft',
		description,
		content: html
	};
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
