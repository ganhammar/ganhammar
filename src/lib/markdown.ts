import { Marked } from 'marked';
import { createHighlighter, type Highlighter, type ThemeRegistration } from 'shiki';
import matter from 'gray-matter';

// Custom retro theme based on vs-dark with fixedsys font styling
const retroTheme: ThemeRegistration = {
	name: 'retro-dark',
	type: 'dark',
	colors: {
		'editor.background': '#1e1e1e',
		'editor.foreground': '#c5c8c6'
	},
	settings: [
		{
			settings: {
				foreground: '#c5c8c6',
				background: '#1e1e1e'
			}
		},
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: {
				foreground: '#6a9955'
			}
		},
		{
			scope: ['keyword', 'storage.type', 'storage.modifier'],
			settings: {
				foreground: '#569cd6'
			}
		},
		{
			scope: ['string', 'string.quoted'],
			settings: {
				foreground: '#ce9178'
			}
		},
		{
			scope: ['constant.numeric'],
			settings: {
				foreground: '#FF73FD'
			}
		},
		{
			scope: ['constant.language.boolean'],
			settings: {
				foreground: '#99CC99'
			}
		},
		{
			scope: ['entity.name.function', 'support.function'],
			settings: {
				foreground: '#569cd6'
			}
		},
		{
			scope: ['entity.name.type', 'entity.name.class', 'support.class'],
			settings: {
				foreground: '#FFFFB6'
			}
		},
		{
			scope: ['variable', 'variable.other'],
			settings: {
				foreground: '#C6C5FE'
			}
		},
		{
			scope: ['entity.name.tag', 'punctuation.definition.tag'],
			settings: {
				foreground: '#569cd6'
			}
		},
		{
			scope: ['entity.other.attribute-name'],
			settings: {
				foreground: '#9cdcfe'
			}
		},
		{
			scope: ['constant.character.escape'],
			settings: {
				foreground: '#d7ba7d'
			}
		},
		{
			scope: ['punctuation'],
			settings: {
				foreground: '#569cd6'
			}
		},
		{
			scope: ['meta.property-name', 'support.type.property-name'],
			settings: {
				foreground: '#ce9178'
			}
		}
	]
};

let highlighter: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: [retroTheme],
			langs: [
				'javascript',
				'typescript',
				'json',
				'html',
				'css',
				'bash',
				'shell',
				'markdown',
				'yaml',
				'csharp',
				'sql',
				'xml',
				'jsx',
				'tsx',
				'python',
				'go',
				'rust',
				'java'
			]
		});
	}
	return highlighter;
}

export type ParsedPost = {
	title: string;
	id: string;
	date: string;
	status: string;
	description: string;
	content: string;
};

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
	const { data, content } = matter(raw);
	const hl = await getHighlighter();

	const marked = new Marked({
		async: true,
		gfm: true
	});

	marked.use({
		renderer: {
			code({ text, lang }) {
				const language = lang || 'text';
				try {
					const html = hl.codeToHtml(text, {
						lang: language,
						theme: 'retro-dark'
					});
					return html;
				} catch {
					// Fallback for unsupported languages
					return `<pre><code class="language-${language}">${escapeHtml(text)}</code></pre>`;
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
