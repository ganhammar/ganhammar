<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} | Ganhammar</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="notice">
	<div class="code">{page.status}</div>
	<p>{page.error?.message ?? 'Something is missing.'}</p>
	<p><a href="/">← All entries</a></p>
</div>
