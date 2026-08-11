<script lang="ts">
	// Prerendered to build/404.html and served by CloudFront for any key that
	// is not in the bucket. It has to be a real route because a static origin
	// has no error handler of its own.
</script>

<svelte:head>
	<title>Not found | Ganhammar</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="notice">
	<div class="code">404</div>
	<p>That page isn't here.</p>
	<p><a href="/">← All entries</a></p>
</div>
