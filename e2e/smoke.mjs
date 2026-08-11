// Post-deploy smoke test: fetches the live site and asserts the page loads.
// Retries to ride out transient errors right after a deploy.
const URL = process.env.SMOKE_URL || 'https://www.ganhammar.se/';
const ATTEMPTS = 5;
const RETRY_DELAY_MS = 10_000;

async function check() {
	const response = await fetch(URL, {
		headers: { 'user-agent': 'smoke-test' },
		redirect: 'follow'
	});
	const body = await response.text();
	if (response.status !== 200) {
		throw new Error(`expected status 200, got ${response.status}: ${body.slice(0, 300)}`);
	}
	if (!body.includes('<html')) {
		throw new Error(`response body does not look like an HTML page: ${body.slice(0, 300)}`);
	}
	// A page that loads but lists nothing would mean the build picked up no
	// posts, which is the failure a status check alone would sail past.
	const posts = (body.match(/href="\/posts\//g) ?? []).length;
	if (posts === 0) {
		throw new Error('index loaded but lists no posts');
	}
	return { bytes: body.length, posts };
}

for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
	try {
		const { bytes, posts } = await check();
		console.log(`PASS ${URL} (200, ${bytes} bytes, ${posts} post links)`);
		process.exit(0);
	} catch (error) {
		console.error(`Attempt ${attempt}/${ATTEMPTS} failed: ${error.message}`);
		if (attempt < ATTEMPTS) {
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
		}
	}
}

console.error(`FAIL ${URL} did not load after ${ATTEMPTS} attempts`);
process.exit(1);
