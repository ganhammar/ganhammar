<script lang="ts">
	import Meta from '$lib/components/Meta.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<Meta />

<div class="hero">
	<p class="lead">
		Hey! I'm Anton Ganhammar. I do dev stuff, and I write it down here. Mostly
		<em>serverless</em>, <em>.NET</em> and whatever I've just taken apart.
	</p>
	<Figure />
</div>

<div class="section-head">
	<span>Entries</span>
	<span>No. · Title · Published</span>
</div>

<ul class="entries">
	{#each data.posts as post (post.id)}
		<li>
			<a class="entry" href="/posts/{post.id}">
				<span class="entry-num">{pad(post.entry)}</span>
				<span class="entry-title">{post.title}</span>
				<time class="entry-date" datetime={post.date}>{post.date}</time>
			</a>
		</li>
	{/each}
</ul>
