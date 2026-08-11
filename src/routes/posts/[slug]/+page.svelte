<script lang="ts">
	import Meta from '$lib/components/Meta.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const articleSchema = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: data.title,
			description: data.description,
			datePublished: data.publishedTime,
			author: { '@type': 'Person', name: 'Anton Ganhammar', url: 'https://ganhammar.se/about' },
			publisher: { '@type': 'Person', name: 'Anton Ganhammar' },
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
	canonicalUrl={data.canonical}
/>

<svelte:head>
	{@html `<script type="application/ld+json">${articleSchema}</script>`}
</svelte:head>

<div class="paper-grid">
	<aside class="rail">
		<div class="rail-block" data-role="meta">
			<h2>Entry</h2>
			<dl>
				<dt>Published</dt>
				<dd>{data.date}</dd>
				<dt>Reading</dt>
				<dd>{data.readingTime} min</dd>
			</dl>
		</div>

		{#if data.headings.length > 2}
			<div class="rail-block" data-role="toc">
				<h2>Contents</h2>
				<ul class="toc" data-toc>
					{#each data.headings as heading (heading.id)}
						<li><a href="#{heading.id}">{heading.text}</a></li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="rail-block" data-role="nav">
			<h2>Navigate</h2>
			<dl>
				{#if data.newer}
					<dt>Newer</dt>
					<dd><a href="/posts/{data.newer.id}">{data.newer.title}</a></dd>
				{/if}
				{#if data.older}
					<dt>Older</dt>
					<dd><a href="/posts/{data.older.id}">{data.older.title}</a></dd>
				{/if}
				<dd><a href="/">← All entries</a></dd>
			</dl>
		</div>
	</aside>

	<article>
		<header class="article-head">
			<p class="entry-no">
				Entry <b>No. {String(data.entry).padStart(2, '0')}</b> ·
				<time datetime={data.publishedTime}>{data.date}</time>
			</p>
			<h1>{data.title}</h1>
			{#if data.canonical}
				<p class="crosspost">
					Originally posted on <a href={data.canonical} rel="noopener">
						{new URL(data.canonical).hostname}
					</a>
				</p>
			{/if}
		</header>

		<div class="prose">
			{@html data.content}
		</div>
	</article>
</div>
