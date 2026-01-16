<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$lib/components/Meta.svelte';

	let { data }: { data: PageData } = $props();

	const formattedDate = $derived(
		new Date(data.date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	);

	const articleSchema = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: data.title,
			description: data.description,
			datePublished: data.publishedTime,
			author: {
				'@type': 'Person',
				name: 'Anton Ganhammar',
				url: 'https://ganhammar.se/about'
			},
			publisher: {
				'@type': 'Person',
				name: 'Anton Ganhammar'
			},
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': `https://ganhammar.se/posts/${data.id}`
			}
		})
	);
</script>

<Meta
	title={data.title}
	description={data.description}
	ogType="article"
	publishedTime={data.publishedTime}
/>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/vs2015.min.css" />
	{@html `<script type="application/ld+json">${articleSchema}</script>`}
</svelte:head>

<article>
	<header class="post-header">
		<div class="post-meta">
			<span class="author">By <a href="/about">Anton Ganhammar</a></span>
			<time datetime={data.publishedTime}>{formattedDate}</time>
			<span class="reading-time">{data.readingTime} min read</span>
		</div>
		<p class="back-link">
			<a href="/">&lt;- Back</a>
		</p>
	</header>
	{@html data.content}
</article>
<p>
	<a href="/">&lt;- Back</a>
</p>

<style>
	.post-header {
		margin-bottom: 2rem;
	}

	.post-meta {
		color: #ffff00;
		font-size: 0.9em;
		padding-bottom: 25px;
		border-bottom: 4px solid #ffff00;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.post-meta .author {
		text-align: left;
	}

	.post-meta time {
		text-align: center;
	}

	.post-meta .reading-time {
		text-align: right;
	}

	.post-meta a {
		color: #ffff00;
	}

	.back-link {
		margin-top: 0.75rem;
		margin-bottom: 0;
	}
</style>
