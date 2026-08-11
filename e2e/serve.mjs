// Static file server for the prerendered build.
//
// URLs are resolved by the same module that is deployed as the CloudFront
// Function, so a page that loads here loads in production for the same reason.
// Used by `npm run preview:static` and by e2e/run.mjs.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handler } from '../infra/edge/rewrite.js';

const ROOT = resolve(fileURLToPath(new URL('../build', import.meta.url)));

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json',
	'.xml': 'application/xml',
	'.txt': 'text/plain; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp'
};

export function rewrite(pathname) {
	return handler({ request: { uri: pathname } }).uri;
}

export function createStaticServer() {
	return createServer(async (req, res) => {
		const url = new URL(req.url, 'http://localhost');
		const key = rewrite(decodeURIComponent(url.pathname));
		const file = join(ROOT, normalize(key));

		if (!file.startsWith(ROOT) || !existsSync(file)) {
			const notFound = join(ROOT, '404.html');
			const body = existsSync(notFound) ? await readFile(notFound) : 'Not found';
			res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
			res.end(body);
			return;
		}

		res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
		res.end(await readFile(file));
	});
}

export function listen(port = 0) {
	return new Promise((ready) => {
		const server = createStaticServer();
		server.listen(port, () => ready({ server, port: server.address().port }));
	});
}

// `node e2e/serve.mjs` runs it directly for a quick look at the built site.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const port = Number(process.env.PORT ?? 4173);
	createStaticServer().listen(port, () => {
		console.log(`Serving build/ on http://localhost:${port}`);
	});
}
