import { Marked, type TokenizerAndRendererExtension, type Tokens } from 'marked';
import { parse as parseYaml } from 'yaml';
import { common, createLowlight } from 'lowlight';
import { toHtml } from 'hast-util-to-html';

const lowlight = createLowlight(common);

export type Heading = { id: string; text: string };

export type ParsedPost = {
	title: string;
	id: string;
	date: string;
	status: string;
	description: string;
	canonical?: string;
	content: string;
	headings: Heading[];
	readingTime: number;
};

/**
 * GitHub alert syntax, reused as the source of margin notes:
 *
 *     > [!NOTE]
 *     > Session state lives in the runtime and vanishes on a cold start.
 *
 * NOTE and TIP are pulled into the right margin beside the text. IMPORTANT,
 * WARNING and CAUTION stay in the flow, because those are the ones a reader
 * must not be able to skip. Anywhere that does not know this syntax, GitHub
 * and the cross-posting targets included, still shows an ordinary blockquote.
 */
const MARGIN_KINDS = new Set(['NOTE', 'TIP']);
const ALERT_OPEN = /^ {0,3}> ?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][^\n]*/i;
const ALERT_BLOCK =
	/^ {0,3}> ?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]([^\n]*)((?:\n {0,3}>[^\n]*)*)(?:\n|$)/i;

type AlertToken = Tokens.Generic & { kind: string; label: string };

const alertExtension: TokenizerAndRendererExtension = {
	name: 'alert',
	level: 'block',
	start(src: string) {
		const index = src.search(ALERT_OPEN);
		return index < 0 ? undefined : index;
	},
	tokenizer(src: string) {
		const match = ALERT_BLOCK.exec(src);
		if (!match) return undefined;

		const [raw, kind, inlineLabel, rest] = match;
		const body = rest
			.split('\n')
			.map((line) => line.replace(/^ {0,3}> ?/, ''))
			.join('\n')
			.trim();

		return {
			type: 'alert',
			raw,
			kind: kind.toUpperCase(),
			label: inlineLabel.trim(),
			tokens: this.lexer.blockTokens(body, [])
		} satisfies AlertToken;
	},
	renderer(token) {
		const { kind, label } = token as AlertToken;
		const inner = this.parser.parse(token.tokens ?? []);
		const heading = label || kind.charAt(0) + kind.slice(1).toLowerCase();
		const tag = MARGIN_KINDS.has(kind) ? 'sidenote' : 'callout';

		return (
			`<aside class="${tag}" data-kind="${kind.toLowerCase()}">` +
			`<b class="${tag}-label">${escapeHtml(heading)}</b>${inner}</aside>`
		);
	}
};

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/<[^>]*>/g, '')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) return { data: {}, body: raw };
	return { data: (parseYaml(match[1]) ?? {}) as Record<string, unknown>, body: match[2] };
}

function generateExcerpt(markdown: string, length = 155): string {
	const text = markdown
		.replace(/```[\s\S]*?```/g, '')
		.replace(/^ {0,3}>.*$/gm, '')
		.replace(/^#+\s.*/gm, '')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[*_~`]/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	return text.length > length ? `${text.slice(0, length).trimEnd()}...` : text;
}

export function parseMarkdown(raw: string): ParsedPost {
	const { data, body } = parseFrontmatter(raw);
	const title = String(data.title ?? '').replace(/^["']|["']$/g, '');
	const headings: Heading[] = [];

	const marked = new Marked({ gfm: true });
	marked.use({
		extensions: [alertExtension],
		renderer: {
			code({ text, lang }) {
				const language = lang?.split(/\s+/)[0];
				try {
					const tree =
						language && lowlight.registered(language)
							? lowlight.highlight(language, text)
							: lowlight.highlightAuto(text);
					return `<pre><code class="hljs${language ? ` language-${language}` : ''}">${toHtml(tree)}</code></pre>`;
				} catch {
					return `<pre><code class="hljs">${escapeHtml(text)}</code></pre>`;
				}
			},
			heading({ tokens, depth }) {
				const text = this.parser.parseInline(tokens);
				// The page supplies the h1, so nothing in the body may use that
				// level. Source `##` sections stay h2 and become the contents rail.
				const level = Math.min(Math.max(depth, 2), 6);
				const id = slugify(text);
				if (level === 2) {
					headings.push({ id, text: text.replace(/<[^>]*>/g, '') });
				}
				return `<h${level} id="${id}">${text}</h${level}>\n`;
			},
			image({ href, title: imgTitle, text }) {
				let src = href;
				if (href && !href.startsWith('http') && !href.startsWith('/')) {
					src = `/posts/assets/${href.replace(/^\.\/assets\//, '').replace(/^assets\//, '')}`;
				}
				const titleAttr = imgTitle ? ` title="${escapeHtml(imgTitle)}"` : '';
				return `<img src="${src}" alt="${escapeHtml(text || '')}"${titleAttr} loading="lazy" decoding="async" />`;
			},
			link({ href, title: linkTitle, tokens }) {
				const text = this.parser.parseInline(tokens);
				const titleAttr = linkTitle ? ` title="${escapeHtml(linkTitle)}"` : '';
				const external = /^https?:\/\//.test(href) && !href.includes('ganhammar.se');
				const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
				return `<a href="${href}"${titleAttr}${rel}>${text}</a>`;
			}
		}
	});

	// Posts open with an h1 restating the title. The page already renders the
	// title, so a body-level h1 is always a duplicate: drop it whether or not
	// the wording matches the frontmatter exactly.
	const withoutDuplicateTitle = body.replace(/^\s*#\s+.+?\r?\n/, '');

	const content = marked.parse(withoutDuplicateTitle) as string;
	const words = withoutDuplicateTitle.replace(/```[\s\S]*?```/g, '').split(/\s+/).length;

	return {
		title,
		id: String(data.id ?? ''),
		date: String(data.date ?? ''),
		status: String(data.status ?? 'draft'),
		description: String(data.description ?? '') || generateExcerpt(withoutDuplicateTitle),
		canonical: data.canonical ? String(data.canonical) : undefined,
		content,
		headings,
		readingTime: Math.max(1, Math.ceil(words / 200))
	};
}
