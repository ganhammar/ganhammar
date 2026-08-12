<script lang="ts">
	import Meta from '$lib/components/Meta.svelte';
	import { AUTHOR, AUTHOR_URL, SITE_URL } from '$lib/site';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const articleSchema = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: data.title,
			description: data.description,
			datePublished: data.publishedTime,
			author: { '@type': 'Person', name: AUTHOR, url: AUTHOR_URL },
			publisher: { '@type': 'Person', name: AUTHOR },
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': `${SITE_URL}/posts/${data.id}`
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
	image={data.cover}
	noindex={data.draft}
/>

<svelte:head>
	<!-- A draft is not a published article, so it gets no BlogPosting markup. -->
	{#if !data.draft}
		{@html `<script type="application/ld+json">${articleSchema}</script>`}
	{/if}
</svelte:head>

<div class="paper-grid">
	<aside class="rail">
		<div class="rail-block" data-role="entry">
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
				{#if data.draft}
					<b class="draft-flag">Draft</b> · No. TBD ·
				{:else}
					Entry <b>No. {String(data.entry).padStart(2, '0')}</b> ·
				{/if}
				<time datetime={data.publishedTime}>{data.date}</time>
				<!-- On a phone the rail is hidden, so the reading time joins the
				     line that already carries the date. -->
				<span class="reading-inline"> · {data.readingTime} min</span>
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
