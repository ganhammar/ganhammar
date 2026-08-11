<script lang="ts">
	import { page } from '$app/state';
	import {
		AUTHOR,
		OG_IMAGE,
		OG_IMAGE_HEIGHT,
		OG_IMAGE_WIDTH,
		SITE_DESCRIPTION,
		SITE_NAME,
		SITE_URL
	} from '$lib/site';

	interface Props {
		title?: string;
		description?: string;
		ogType?: 'website' | 'article';
		publishedTime?: string;
		author?: string;
		canonicalUrl?: string;
		image?: string;
	}

	let {
		title = SITE_NAME,
		description = SITE_DESCRIPTION,
		ogType = 'website',
		publishedTime = undefined,
		author = AUTHOR,
		canonicalUrl = undefined,
		image = undefined
	}: Props = $props();

	// A cross-posted piece points its canonical at the original; everything else
	// points at itself. Prerendered pages have a stable pathname, so this is
	// resolved once at build time.
	const canonical = $derived(canonicalUrl ?? `${SITE_URL}${page.url.pathname}`);
	// A post with its own cover uses it; everything else gets the site card.
	const ogImage = $derived(image ?? OG_IMAGE);
	const fullTitle = $derived(title === SITE_NAME ? title : `${title} | ${SITE_NAME}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" type="application/rss+xml" title={SITE_NAME} href="{SITE_URL}/rss.xml" />

	<meta property="og:type" content={ogType} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:image" content={ogImage} />
	{#if !image}
		<meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
		<meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
	{/if}
	<meta property="og:image:alt" content={image ? title : 'Ganhammar — notes on serverless and .NET'} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	{#if ogType === 'article' && publishedTime}
		<meta property="article:author" content={author} />
		<meta property="article:published_time" content={publishedTime} />
	{/if}
</svelte:head>
