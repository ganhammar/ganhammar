// End-to-end test: invokes the built Lambda handler (build/handler.js) with
// synthetic API Gateway v2 events and asserts that pages render. Run after
// `npm run build`. Requires API_TOKEN for routes that fetch posts from GitHub.
import assert from 'node:assert/strict';
import { handler } from '../build/handler.js';

function makeEvent(path) {
	return {
		version: '2.0',
		routeKey: 'ANY /{proxy+}',
		rawPath: path,
		rawQueryString: '',
		headers: {
			host: 'www.ganhammar.se',
			'x-forwarded-proto': 'https',
			'user-agent': 'e2e-test'
		},
		requestContext: {
			domainName: 'www.ganhammar.se',
			http: {
				method: 'GET',
				path,
				protocol: 'HTTP/1.1',
				sourceIp: '127.0.0.1',
				userAgent: 'e2e-test'
			}
		},
		isBase64Encoded: false
	};
}

const checks = [
	{ path: '/', contains: '<html' },
	{ path: '/about', contains: '<html' },
	{ path: '/sitemap.xml', contains: '<urlset' }
];

let failed = false;

for (const { path, contains } of checks) {
	try {
		const response = await handler(makeEvent(path), {});
		assert.equal(
			response.statusCode,
			200,
			`${path}: expected status 200, got ${response.statusCode}\n${response.body?.slice(0, 500)}`
		);
		assert.ok(
			response.body.includes(contains),
			`${path}: response body does not contain ${JSON.stringify(contains)}`
		);
		console.log(`PASS ${path} (${response.statusCode}, ${response.body.length} bytes)`);
	} catch (error) {
		failed = true;
		console.error(`FAIL ${path}`);
		console.error(error.message);
	}
}

process.exit(failed ? 1 : 0);
