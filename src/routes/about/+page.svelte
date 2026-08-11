<script lang="ts">
	import Meta from '$lib/components/Meta.svelte';
	import { AUTHOR, SITE_URL } from '$lib/site';

	const personSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: AUTHOR,
		url: SITE_URL,
		jobTitle: 'Software Engineer',
		description:
			'Software engineer with 15+ years of experience specializing in platform engineering and cloud architecture',
		sameAs: ['https://github.com/ganhammar']
	});
</script>

<Meta
	title="About"
	description="Anton Ganhammar - Software engineer with 15+ years of experience sharing thoughts on platform engineering, cloud architecture, and modern tech."
/>

<svelte:head>
	{@html `<script type="application/ld+json">${personSchema}</script>`}
</svelte:head>

<div class="paper-grid">
	<aside class="rail">
		<div class="rail-block" data-role="meta">
			<h2>Details</h2>
			<dl>
				<dt>Based in</dt>
				<dd>Gothenburg, Sweden</dd>
				<dt>Doing this for</dt>
				<dd>15+ years</dd>
				<dt>Mostly</dt>
				<dd>Platform &amp; cloud</dd>
			</dl>
		</div>
		<div class="rail-block" data-role="nav">
			<h2>Elsewhere</h2>
			<dl>
				<dd>
					<a href="https://github.com/ganhammar" target="_blank" rel="noopener">GitHub</a>
				</dd>
				<dd><a href="/rss.xml">RSS</a></dd>
				<dd><a href="/">← All entries</a></dd>
			</dl>
		</div>
	</aside>

	<article>
		<header class="article-head">
			<p class="entry-no">Colophon</p>
			<h1>About</h1>
		</header>

		<div class="prose">
			<p>
				Hey! I'm Anton Ganhammar, a software engineer with 15+ years of experience, based in
				Gothenburg. I work with platform engineering, cloud architecture, and building things that
				(hopefully) make developers' lives easier.
			</p>
			<p>
				This blog is where I share random thoughts, experiments, and things I've learned along the
				way. Nothing too fancy, just dev stuff.
			</p>

			<h2>How this site is built</h2>
			<p>
				Posts live as markdown in a separate repository. Every page here is rendered once at build
				time and served as a static file from CloudFront, so there is no server answering requests
				and nothing to warm up. The drawing on the front page describes that path.
			</p>
			<p>
				Source is on <a href="https://github.com/ganhammar/ganhammar" target="_blank" rel="noopener"
					>GitHub</a
				>.
			</p>
		</div>
	</article>
</div>
