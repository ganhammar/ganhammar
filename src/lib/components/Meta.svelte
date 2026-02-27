<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

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
		description = 'Software developer sharing thoughts, experiments, and practical insights on web development.',
		ogType = 'website',
		publishedTime = undefined,
		author = 'Anton Ganhammar',
		canonicalUrl = undefined
	}: Props = $props();

	const baseUrl = dev ? 'http://localhost:5173' : 'https://ganhammar.se';
	const canonical = $derived(canonicalUrl ?? `${baseUrl}${$page.url.pathname}`);
	const fullTitle = $derived(title === 'Ganhammar' ? title : `${title} | Ganhammar`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<!-- Open Graph -->
	<meta property="og:type" content={ogType} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:site_name" content="Ganhammar" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	<!-- Article Specific -->
	{#if ogType === 'article' && publishedTime}
		<meta property="article:author" content={author} />
		<meta property="article:published_time" content={publishedTime} />
	{/if}
</svelte:head>
