import { Marked, type TokenizerAndRendererExtension, type Tokens } from 'marked';
import { parse as parseYaml } from 'yaml';
import { common, createLowlight } from 'lowlight';
import { toHtml } from 'hast-util-to-html';
import type { Dimensions } from '$lib/image-size';

const lowlight = createLowlight(common);

export type Heading = { id: string; text: string };

export type ParsedPost = {
	title: string;
	id: string;
	date: string;
	status: string;
	description: string;
	canonical?: string;
	/** Social preview for this post, absolute or relative to posts/assets. */
	cover?: string;
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

	if (text.length <= length) return text;

	// Cut back to a word boundary so the description does not end mid-word.
	const clipped = text.slice(0, length);
	const lastSpace = clipped.lastIndexOf(' ');
	return `${(lastSpace > length * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}...`;
}

export type ParseOptions = {
	/** Asset dimensions, so images can carry width and height and not reflow. */
	assetSizes?: Map<string, Dimensions>;
	/** Every published asset, used to spot a video beside an animated GIF. */
	assetNames?: Set<string>;
};

export function parseMarkdown(raw: string, options: ParseOptions = {}): ParsedPost {
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
				let asset: string | undefined;
				if (href && !href.startsWith('http') && !href.startsWith('/')) {
					asset = href.replace(/^\.\/assets\//, '').replace(/^assets\//, '');
					src = `/posts/assets/${asset}`;
				}

				const size = asset ? options.assetSizes?.get(asset) : undefined;
				const dimensions = size ? ` width="${size.width}" height="${size.height}"` : '';
				const titleAttr = imgTitle ? ` title="${escapeHtml(imgTitle)}"` : '';
				const alt = escapeHtml(text || '');

				// An animated GIF is served as H.264 when an .mp4 of the same name
				// has been committed beside it. The post still says `![](...gif)`,
				// so GitHub and the cross-posts keep showing the GIF, and the
				// original stays as the fallback for anything that cannot play it.
				const video = asset?.replace(/\.gif$/i, '.mp4');
				if (asset && video && video !== asset && options.assetNames?.has(video)) {
					const poster = asset.replace(/\.gif$/i, '-poster.jpg');
					const posterAttr = options.assetNames?.has(poster)
						? ` poster="/posts/assets/${poster}"`
						: '';
					return (
						`<video class="motion" autoplay loop muted playsinline preload="metadata"` +
						`${posterAttr}${dimensions} aria-label="${alt}">` +
						`<source src="/posts/assets/${video}" type="video/mp4" />` +
						`<img src="${src}" alt="${alt}"${dimensions} loading="lazy" decoding="async" />` +
						`</video>`
					);
				}

				return `<img src="${src}" alt="${alt}"${titleAttr}${dimensions} loading="lazy" decoding="async" />`;
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
		cover: data.cover ? String(data.cover) : undefined,
		content,
		headings,
		readingTime: Math.max(1, Math.ceil(words / 200))
	};
}
