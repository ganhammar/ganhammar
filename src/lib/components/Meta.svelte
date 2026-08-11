<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		title?: string;
		description?: string;
		ogType?: 'website' | 'article';
		publishedTime?: string;
		author?: string;
		canonicalUrl?: string;
	}

	let {
		title = 'Ganhammar',
		description = "Notes on serverless, .NET, and whatever I've just taken apart.",
		ogType = 'website',
		publishedTime = undefined,
		author = 'Anton Ganhammar',
		canonicalUrl = undefined
	}: Props = $props();

	const BASE = 'https://ganhammar.se';

	// A cross-posted piece points its canonical at the original; everything else
	// points at itself. Prerendered pages have a stable pathname, so this is
	// resolved once at build time.
	const canonical = $derived(canonicalUrl ?? `${BASE}${page.url.pathname}`);
	const fullTitle = $derived(title === 'Ganhammar' ? title : `${title} | Ganhammar`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" type="application/rss+xml" title="Ganhammar" href="{BASE}/rss.xml" />

	<meta property="og:type" content={ogType} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:site_name" content="Ganhammar" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	{#if ogType === 'article' && publishedTime}
		<meta property="article:author" content={author} />
		<meta property="article:published_time" content={publishedTime} />
	{/if}
</svelte:head>
