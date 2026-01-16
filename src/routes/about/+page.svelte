<script lang="ts">
	import Meta from '$lib/components/Meta.svelte';

	const personSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Anton Ganhammar',
		url: 'https://ganhammar.se',
		jobTitle: 'Software Engineer',
		description: 'Software engineer with 15+ years of experience specializing in platform engineering and cloud architecture',
		sameAs: ['https://github.com/ganhammar']
	});
</script>

<Meta
	title="About"
	description="Anton Ganhammar - Software engineer with 15+ years of experience sharing thoughts on platform engineering, cloud architecture, and modern tech."
/>

<svelte:head>
	{@html `<script type="application/ld+json">${personSchema}</script>`}
</svelte:head>

<article class="about">
	<h1>About</h1>

	<section>
		<p>
			Hey! I'm Anton Ganhammar, a software engineer with 15+ years of experience based in Sweden.
			I work with platform engineering, cloud architecture, and building things that (hopefully)
			make developers' lives easier.
		</p>
		<p>
			This blog is where I share random thoughts, experiments, and things I've learned along the
			way. Nothing too fancy, just dev stuff.
		</p>
	</section>

	<section>
		<h2>Connect</h2>
		<p>
			<a href="https://github.com/ganhammar" target="_blank" rel="noopener">GitHub</a> - Where most of my code lives
		</p>
	</section>
</article>

<style>
	.about {
		line-height: 1.8;
	}

	.about h1 {
		margin-bottom: 1.5rem;
	}

	.about section {
		margin-bottom: 2rem;
	}

	.about h2 {
		margin-bottom: 0.75rem;
		border-bottom: 4px solid #ffff00;
		padding-bottom: 0.5rem;
	}

	.about a {
		color: #ffff00;
	}
</style>
