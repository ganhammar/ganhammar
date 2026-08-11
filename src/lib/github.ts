import { env } from '$env/dynamic/private';

const REPOSITORY = 'ganhammar/ganhammar-posts';
const API_URL = `https://api.github.com/repos/${REPOSITORY}`;
const RAW_URL = `https://raw.githubusercontent.com/${REPOSITORY}`;
const ASSET_PREFIX = 'posts/assets/';

export type Post = {
	id: string;
	title: string;
	date: string;
	status: string;
	/** Stable publication number: the first post ever written is 1. */
	entry: number;
};

type TreeNode = { path: string; type: string };

function headers(): HeadersInit {
	const token = env.API_TOKEN;
	return {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'ganhammar.se-build',
		...(token ? { Authorization: `Bearer ${token}` } : {})
	};
}

async function githubJson<T>(url: string): Promise<T> {
	const response = await fetch(url, { headers: headers() });
	if (!response.ok) {
		throw new Error(`GitHub API ${response.status} for ${url}`);
	}
	return (await response.json()) as T;
}

/**
 * The commit every file in this build is read from.
 *
 * Everything is fetched from a URL pinned to this SHA rather than to `main`.
 * That is not just tidiness: raw.githubusercontent.com serves a branch path
 * from a CDN that can lag a push by minutes, so a build kicked off by a
 * publish would otherwise have a good chance of baking in the previous
 * version of the post that triggered it. A commit-addressed URL is immutable,
 * so its cache can only ever be right.
 */
let commitPromise: Promise<string> | null = null;

function resolveCommit(): Promise<string> {
	commitPromise ??= githubJson<{ object: { sha: string } }>(
		`${API_URL}/git/ref/heads/main`
	).then((ref) => ref.object.sha);
	return commitPromise;
}

/** One recursive read listing every post and asset in the repository. */
let treePromise: Promise<TreeNode[]> | null = null;

function loadTree(): Promise<TreeNode[]> {
	treePromise ??= (async () => {
		const commit = await resolveCommit();
		const tree = await githubJson<{ tree: TreeNode[] }>(
			`${API_URL}/git/trees/${commit}?recursive=1`
		);
		return tree.tree.filter((node) => node.type === 'blob');
	})();
	return treePromise;
}

async function fetchRaw(path: string): Promise<Response> {
	const commit = await resolveCommit();
	const response = await fetch(`${RAW_URL}/${commit}/${path}`, { headers: headers() });
	if (!response.ok) {
		throw new Error(`GitHub raw ${response.status} for ${path}`);
	}
	return response;
}

/**
 * Every post's raw source, keyed by slug.
 *
 * The whole site is prerendered, so this runs during `vite build` and never in
 * response to a request. It is memoised because the build asks for the post
 * list, then each post body, then the feeds: without this the same ten files
 * would be pulled several times over.
 */
let sourcesPromise: Promise<Map<string, string>> | null = null;

function loadSources(): Promise<Map<string, string>> {
	sourcesPromise ??= (async () => {
		// POSTS_DIR points the build at a local checkout of the posts repo
		// instead of the API, so a draft can be previewed before it is pushed
		// and the site can be built without network access.
		if (env.POSTS_DIR) {
			const { readdir, readFile } = await import('node:fs/promises');
			const { join } = await import('node:path');
			const dir = join(env.POSTS_DIR, 'posts');
			const names = (await readdir(dir)).filter((name) => name.endsWith('.mdx'));

			return new Map(
				await Promise.all(
					names.map(
						async (name) =>
							[name.replace(/\.mdx$/, ''), await readFile(join(dir, name), 'utf8')] as const
					)
				)
			);
		}

		const tree = await loadTree();
		const posts = tree.filter((node) => /^posts\/[^/]+\.mdx$/.test(node.path));

		return new Map(
			await Promise.all(
				posts.map(async (node) => {
					const slug = node.path.replace(/^posts\//, '').replace(/\.mdx$/, '');
					return [slug, await (await fetchRaw(node.path)).text()] as const;
				})
			)
		);
	})();

	return sourcesPromise;
}

/** Reads only the frontmatter block, without paying for a full markdown parse. */
function readFrontmatter(raw: string): Record<string, string> {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};

	const fields: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx > 0) {
			fields[line.slice(0, idx).trim()] = line
				.slice(idx + 1)
				.trim()
				.replace(/^["']|["']$/g, '');
		}
	}
	return fields;
}

export async function getPosts(): Promise<Post[]> {
	const sources = await loadSources();

	const published = [...sources.entries()]
		.map(([slug, raw]) => {
			const fields = readFrontmatter(raw);
			return {
				id: fields.id || slug,
				title: fields.title || '',
				date: fields.date || '',
				status: fields.status || 'draft'
			};
		})
		.filter((post) => post.status === 'published')
		// Oldest first, breaking ties on id so the numbering cannot shift with
		// the order the listing happens to come back in.
		.sort((a, b) => {
			const byDate = new Date(a.date).getTime() - new Date(b.date).getTime();
			return byDate !== 0 ? byDate : a.id.localeCompare(b.id);
		});

	// The number is assigned oldest-first so a post keeps it for good. Display
	// order is newest-first, but posts sharing a date stay in publication order
	// so a two-parter reads part one before part two.
	return published
		.map((post, i) => ({ ...post, entry: i + 1 }))
		.sort((a, b) => {
			const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
			return byDate !== 0 ? byDate : a.entry - b.entry;
		});
}

export async function getPostSource(slug: string): Promise<string> {
	const sources = await loadSources();
	const raw = sources.get(slug);
	if (!raw) {
		throw new Error(`No post named ${slug}`);
	}
	return raw;
}

const CONTENT_TYPES: Record<string, string> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	svg: 'image/svg+xml',
	webp: 'image/webp'
};

/**
 * Every asset path, relative to `posts/assets` and including subdirectories,
 * so images can be filed in a folder per post.
 */
export async function getAssetNames(): Promise<string[]> {
	if (env.POSTS_DIR) {
		const { readdir } = await import('node:fs/promises');
		const { join, posix } = await import('node:path');

		const walk = async (dir: string, prefix = ''): Promise<string[]> => {
			const entries = await readdir(dir, { withFileTypes: true });
			const found = await Promise.all(
				entries
					.filter((entry) => !entry.name.startsWith('.'))
					.map((entry) =>
						entry.isDirectory()
							? walk(join(dir, entry.name), posix.join(prefix, entry.name))
							: Promise.resolve([posix.join(prefix, entry.name)])
					)
			);
			return found.flat();
		};

		return walk(join(env.POSTS_DIR, 'posts', 'assets'));
	}

	const tree = await loadTree();
	return tree
		.filter((node) => node.path.startsWith(ASSET_PREFIX))
		.map((node) => node.path.slice(ASSET_PREFIX.length));
}

export async function getAsset(name: string): Promise<{ body: ArrayBuffer; contentType: string }> {
	// Keep any subdirectory, drop a leading ./ or assets/, and refuse to climb
	// out of the assets folder.
	const filename = name
		.replace(/^\.\//, '')
		.replace(/^assets\//, '')
		.split('/')
		.filter((segment) => segment && segment !== '.' && segment !== '..')
		.join('/');
	const extension = filename.split('.').pop()?.toLowerCase() ?? '';

	if (env.POSTS_DIR) {
		const { readFile } = await import('node:fs/promises');
		const { join } = await import('node:path');
		const buffer = await readFile(join(env.POSTS_DIR, 'posts', 'assets', filename));
		return {
			// Node pools Buffer memory, so copy out the exact range rather than
			// handing over a view onto a shared allocation.
			body: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
			contentType: CONTENT_TYPES[extension] ?? 'application/octet-stream'
		};
	}

	const response = await fetchRaw(`${ASSET_PREFIX}${filename}`);
	return {
		body: await response.arrayBuffer(),
		contentType: response.headers.get('content-type') || 'application/octet-stream'
	};
}
