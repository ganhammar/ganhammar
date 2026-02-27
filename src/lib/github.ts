import { env } from '$env/dynamic/private';

const REPOSITORY = 'ganhammar/ganhammar-posts';
const BASE_URL = `https://api.github.com/repos/${REPOSITORY}/contents`;

function getApiToken(): string {
	return env.API_TOKEN || '';
}

export type Post = {
	id: string;
	title: string;
	date: string;
	status: string;
};

export type PostContent = {
	title: string;
	content: string;
};

type ContentsResponse = {
	path: string;
	type: string;
	name: string;
	download_url: string;
};

type FileResponse = {
	content: string;
	name: string;
};

// Simple LRU-like cache with TTL
const cache = new Map<string, { data: unknown; timestamp: number; etag?: string }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache<T>(
	url: string,
	options: { etag?: string } = {}
): Promise<{ data: T; etag?: string }> {
	const cached = cache.get(url);
	const now = Date.now();

	const headers: HeadersInit = {
		Authorization: `Bearer ${getApiToken()}`,
		Accept: 'application/vnd.github.v3+json'
	};

	if (cached && cached.etag) {
		headers['If-None-Match'] = cached.etag;
	}

	const response = await fetch(url, { headers });

	if (response.status === 304 && cached) {
		cached.timestamp = now;
		return { data: cached.data as T, etag: cached.etag };
	}

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.status}`);
	}

	const data = (await response.json()) as T;
	const etag = response.headers.get('etag') || undefined;

	cache.set(url, { data, timestamp: now, etag });

	// Clean old cache entries
	if (cache.size > 100) {
		for (const [key, value] of cache) {
			if (now - value.timestamp > CACHE_TTL) {
				cache.delete(key);
			}
		}
	}

	return { data, etag };
}

const metadataCache = new Map<string, Post>();

async function fetchAndExtractMetadata(file: ContentsResponse): Promise<Post> {
	if (metadataCache.has(file.path)) {
		return metadataCache.get(file.path)!;
	}

	const response = await fetch(file.download_url, {
		headers: {
			Authorization: `Bearer ${getApiToken()}`
		}
	});
	const content = await response.text();
	const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
	const fields: Record<string, string> = {};
	if (fmMatch) {
		for (const line of fmMatch[1].split('\n')) {
			const idx = line.indexOf(':');
			if (idx > 0) {
				fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
			}
		}
	}
	const metadata = {
		title: (fields.title || '').replace(/^"|"$/g, ''),
		id: fields.id || '',
		date: fields.date || '',
		status: fields.status || 'draft'
	};

	metadataCache.set(file.path, metadata);

	return metadata;
}

export async function getPosts(): Promise<Post[]> {
	const { data } = await fetchWithCache<ContentsResponse[]>(`${BASE_URL}/posts`);

	const posts = await Promise.all(
		data.filter((file) => file.type === 'file').map((file) => fetchAndExtractMetadata(file))
	);

	return posts
		.filter((post) => post.status === 'published')
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPost(slug: string): Promise<PostContent> {
	const { data } = await fetchWithCache<FileResponse>(`${BASE_URL}/posts/${slug}.mdx`);

	const content = Buffer.from(data.content, 'base64').toString();

	return { title: '', content };
}

export async function getAsset(path: string): Promise<{ content: Buffer; contentType: string }> {
	// Extract just the filename from paths like "./assets/image.png"
	const filename = path.split('/').pop() || path;
	const { data } = await fetchWithCache<FileResponse>(`${BASE_URL}/posts/assets/${filename}`);

	const content = Buffer.from(data.content, 'base64');

	let contentType = 'text/plain';
	if (data.name.endsWith('.png')) {
		contentType = 'image/png';
	} else if (data.name.endsWith('.jpg') || data.name.endsWith('.jpeg')) {
		contentType = 'image/jpeg';
	} else if (data.name.endsWith('.gif')) {
		contentType = 'image/gif';
	} else if (data.name.endsWith('.webp')) {
		contentType = 'image/webp';
	} else if (data.name.endsWith('.svg')) {
		contentType = 'image/svg+xml';
	}

	return { content, contentType };
}
