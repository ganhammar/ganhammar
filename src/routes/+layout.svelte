<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { AUTHOR, AUTHOR_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '$lib/site';
	import type { LayoutServerData } from './$types';

	let { data, children }: { data: LayoutServerData; children: import('svelte').Snippet } =
		$props();

	const nav = [
		{ href: '/', label: 'Posts' },
		{ href: '/about', label: 'About' },
		{ href: '/rss.xml', label: 'RSS' },
		{ href: 'https://github.com/ganhammar', label: 'GitHub', external: true }
	];

	const websiteSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Blog',
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		author: { '@type': 'Person', name: AUTHOR, url: AUTHOR_URL }
	});

	let path = $derived(page.url.pathname);
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${websiteSchema}</script>`}
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<div class="sheet">
	<header class="masthead">
		<div>
			<p class="wordmark"><a href="/">Ganhammar<span class="stop">.</span></a></p>
			<p class="tagline">Notes on serverless, .NET, and whatever I've just taken apart.</p>
		</div>
		<dl class="colophon">
			<dt>Author</dt>
			<dd>Anton Ganhammar</dd>
			<dt>Writing since</dt>
			<dd>{data.colophon.since}</dd>
			<dt>Entries</dt>
			<dd>{data.colophon.entries}</dd>
			<dt>Last updated</dt>
			<dd>{data.colophon.updated}</dd>
		</dl>
	</header>

	<nav class="mainnav">
		{#each nav as item (item.href)}
			<a
				href={item.href}
				aria-current={path === item.href ? 'page' : undefined}
				target={item.external ? '_blank' : undefined}
				rel={item.external ? 'noopener' : undefined}>{item.label}</a
			>
		{/each}
	</nav>

	<main id="main">
		{@render children()}
	</main>

	<footer>
		<span>
			<a href="/about">About</a> ·
			<a href="/rss.xml">RSS</a> ·
			<a href="https://github.com/ganhammar" target="_blank" rel="noopener">GitHub</a>
		</span>
		<span>&copy; {new Date().getFullYear()} Anton Ganhammar · Gothenburg</span>
	</footer>
</div>
