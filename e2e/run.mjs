// End-to-end test over the prerendered output.
//
// Serves build/ through the same URL rewriting that CloudFront applies, then
// fetches pages the way a browser would. Run after `npm run build`; it needs
// no credentials, because the GitHub calls all happened during the build.
import assert from 'node:assert/strict';
import { listen, rewrite } from './serve.mjs';

const { server, port } = await listen();
const base = `http://localhost:${port}`;

let failures = 0;

async function check(name, fn) {
	try {
		await fn();
		console.log(`PASS ${name}`);
	} catch (error) {
		failures++;
		console.error(`FAIL ${name}\n     ${error.message.split('\n')[0]}`);
	}
}

async function get(path) {
	const response = await fetch(base + path);
	return { status: response.status, body: await response.text(), response };
}

// The rewrite rule is the one piece of request-time logic left in the stack,
// so its behaviour is pinned here rather than only exercised indirectly.
await check('url rewriting', () => {
	assert.equal(rewrite('/'), '/index.html');
	assert.equal(rewrite('/about'), '/about.html');
	assert.equal(rewrite('/posts/some-slug'), '/posts/some-slug.html');
	assert.equal(rewrite('/sitemap.xml'), '/sitemap.xml');
	assert.equal(rewrite('/posts/assets/pic.png'), '/posts/assets/pic.png');
	assert.equal(rewrite('/_app/immutable/x.css'), '/_app/immutable/x.css');
});

await check('index lists every post', async () => {
	const { status, body } = await get('/');
	assert.equal(status, 200, `expected 200, got ${status}`);
	assert.match(body, /Anton Ganhammar/);
	const links = [...body.matchAll(/href="\/posts\/[^"]+"/g)];
	assert.ok(links.length >= 10, `expected at least 10 post links, found ${links.length}`);
});

await check('index ships no framework javascript', async () => {
	const { body } = await get('/');
	assert.doesNotMatch(
		body,
		/<script[^>]+src=/,
		'a script src appeared; the site is meant to ship no client bundle'
	);
	assert.match(body, /<style>/, 'stylesheet should be inlined into the page');
});

await check('about renders', async () => {
	const { status, body } = await get('/about');
	assert.equal(status, 200, `expected 200, got ${status}`);
	assert.match(body, /Gothenburg/);
});

await check('post renders with prose and highlighted code', async () => {
	const { status, body } = await get('/posts/api-routing-using-cloudfront-function');
	assert.equal(status, 200, `expected 200, got ${status}`);
	assert.match(body, /class="prose"/);
	assert.match(body, /class="hljs/, 'code should be highlighted at build time');
	assert.doesNotMatch(body, /cdnjs\.cloudflare\.com/, 'no external stylesheet should remain');
	assert.doesNotMatch(body, /<h1[^>]*>[^<]*<\/h1>[\s\S]*<h1/, 'only one h1 per page');
});

await check('contents rail links every section of a long post', async () => {
	const { body } = await get('/posts/dotnet-8-aot-aws-lambda');
	const ids = [...body.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
	assert.ok(ids.length > 2, `expected several sections, found ${ids.length}`);
	assert.match(body, /data-toc/, 'a post this long should have a contents rail');
	for (const id of ids) {
		assert.match(body, new RegExp(`href="#${id}"`), `contents rail should link #${id}`);
	}
});

await check('contents rail is omitted from a short post', async () => {
	const { body } = await get('/posts/api-routing-using-cloudfront-function');
	const ids = [...body.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
	assert.ok(ids.length <= 2, 'fixture assumed to be a short post');
	assert.doesNotMatch(body, /<h2>Contents<\/h2>/, 'rail should be hidden with too few sections');
});

await check('images point at deployed assets', async () => {
	const { body } = await get(
		'/posts/building-a-centaur-chess-app-with-agentcore-runtime-and-strands-agents'
	);
	assert.match(body, /src="\/posts\/assets\/[^"]+"/);
	assert.match(body, /loading="lazy"/);

	const src = body.match(/src="(\/posts\/assets\/[^"]+)"/)[1];
	const asset = await fetch(base + src);
	assert.equal(asset.status, 200, `asset ${src} should be part of the build`);
});

await check('an animated gif is upgraded to video with the gif still behind it', async () => {
	const { body } = await get(
		'/posts/building-a-centaur-chess-app-with-agentcore-runtime-and-strands-agents'
	);
	const video = body.match(/<video[\s\S]{0,600}?<\/video>/);
	assert.ok(video, 'expected a <video> where the post references a gif');

	const markup = video[0];
	for (const attribute of ['autoplay', 'loop', 'muted', 'playsinline']) {
		assert.match(markup, new RegExp(attribute), `video should carry ${attribute}`);
	}
	assert.match(markup, /<source src="[^"]+\.mp4"/, 'should serve an mp4');
	assert.match(markup, /<img src="[^"]+\.gif"/, 'the gif should remain as fallback content');
	assert.match(markup, /poster="[^"]+"/, 'should have a poster frame');

	for (const path of [
		'/posts/assets/centaur-chess-game-screenshot.mp4',
		'/posts/assets/centaur-chess-game-screenshot.gif'
	]) {
		assert.equal((await get(path)).status, 200, `${path} should be deployed`);
	}
});

await check('a post with a cover uses it as the social image', async () => {
	const withCover = await get(
		'/posts/building-a-centaur-chess-app-with-agentcore-runtime-and-strands-agents'
	);
	assert.match(withCover.body, /property="og:image" content="[^"]*centaur-chess-cover\.jpg"/);

	const withoutCover = await get('/posts/dotnet-8-aot-aws-lambda');
	assert.match(withoutCover.body, /property="og:image" content="[^"]*\/og\.png"/);
});

await check('canonical urls all point at the www host', async () => {
	for (const path of ['/', '/about', '/posts/dotnet-8-aot-aws-lambda']) {
		const { body } = await get(path);
		const canonical = body.match(/<link rel="canonical" href="([^"]+)"/)[1];
		assert.match(canonical, /^https:\/\/www\.ganhammar\.se/, `${path} canonical is ${canonical}`);
	}
	assert.match((await get('/robots.txt')).body, /Sitemap: https:\/\/www\.ganhammar\.se/);
	assert.doesNotMatch((await get('/sitemap.xml')).body, /<loc>https:\/\/ganhammar\.se/);
});

await check('images declare their dimensions', async () => {
	const { body } = await get('/posts/blazingly-fast-serverless-note-app-part-1');
	const images = [...body.matchAll(/<img [^>]*src="\/posts\/assets\/[^>]*>/g)].map((m) => m[0]);
	assert.ok(images.length > 0, 'expected at least one post image');
	for (const image of images) {
		assert.match(image, /width="\d+" height="\d+"/, `missing dimensions: ${image}`);
	}
});

await check('a draft is reachable by url but kept out of everything else', async () => {
	const slug = 'who-approved-this-delegated-authorization-for-ai-agents';

	const { status, body } = await get(`/posts/${slug}`);
	assert.equal(status, 200, 'a draft should still render at its own url');
	assert.match(body, /class="prose"/, 'draft body should be rendered');
	assert.match(body, /name="robots" content="noindex, nofollow"/, 'draft must not be indexable');
	assert.doesNotMatch(body, /BlogPosting/, 'a draft should not claim to be a published article');

	assert.doesNotMatch((await get('/')).body, new RegExp(slug), 'draft must not be listed');
	assert.doesNotMatch((await get('/sitemap.xml')).body, new RegExp(slug), 'not in the sitemap');
	assert.doesNotMatch((await get('/rss.xml')).body, new RegExp(slug), 'not in the feed');

	// Neighbouring published posts must not link into it either.
	const newest = await get('/posts/building-a-centaur-chess-app-with-agentcore-runtime-and-strands-agents');
	assert.doesNotMatch(newest.body, new RegExp(slug), 'published posts should not link to a draft');
});

await check('published posts are indexable', async () => {
	const { body } = await get('/posts/dotnet-8-aot-aws-lambda');
	assert.doesNotMatch(body, /name="robots"/, 'a published post should carry no robots restriction');
	assert.match(body, /BlogPosting/);
});

await check('the theme has all three states and a switch to drive them', async () => {
	const { body } = await get('/');

	// System by default, and an explicit choice that wins in either direction.
	assert.match(body, /@media\s*\(prefers-color-scheme:\s*dark\)/, 'should follow the system');
	assert.match(body, /:root:not\(\[data-theme=light\]\)/, 'explicit light must beat a dark system');
	assert.match(body, /:root\[data-theme=dark\]/, 'explicit dark must beat a light system');

	// Set before the stylesheet so a stored choice never flashes the other theme.
	const head = body.slice(0, body.indexOf('</head>'));
	assert.match(head, /localStorage\.getItem\('theme'\)/, 'bootstrap belongs in the head');
	assert.ok(
		head.indexOf('localStorage') < head.indexOf('<style>'),
		'bootstrap must run before the stylesheet'
	);

	assert.match(body, /data-theme-toggle/, 'the switch should be in the markup');
	assert.match(body, /\[data-js\] \.theme-toggle/, 'and hidden until the script has run');
});

await check('feeds are generated', async () => {
	const sitemap = await get('/sitemap.xml');
	assert.equal(sitemap.status, 200);
	assert.match(sitemap.body, /<urlset/);

	const rss = await get('/rss.xml');
	assert.equal(rss.status, 200);
	assert.match(rss.body, /<rss/);
	assert.ok((rss.body.match(/<item>/g) ?? []).length >= 10, 'feed should list every post');
});

await check('unknown paths return the 404 page', async () => {
	const { status, body } = await get('/posts/does-not-exist');
	assert.equal(status, 404, `expected 404, got ${status}`);
	assert.match(body, /404/);
});

server.close();

if (failures) {
	console.error(`\n${failures} check(s) failed`);
	process.exit(1);
}
console.log('\nAll checks passed');
