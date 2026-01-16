<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$lib/components/Meta.svelte';

	let { data }: { data: PageData } = $props();
</script>

<Meta
	title="Anton Ganhammar - Developer & Tech Experimenter"
	description="Software developer sharing thoughts, experiments, and practical insights on web development, cloud architecture, and modern tech."
/>

<div style="font-family: system-ui, sans-serif; line-height: 1.8;">
	<h1>Hey! I'm Anton Ganhammar.</h1>
	<p>I do dev stuff, here are some random thoughts and experiments:</p>
	<ul>
		{#each data.posts as post (post.id)}
			<li>
				<a class="title" href="/posts/{post.id}">{post.title}</a>
				<span class="date">{post.date}</span>
			</li>
		{/each}
	</ul>
</div>
