<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();

	const getNumber = (pathname: string) => {
		if (pathname === '/') return 100;
		return Math.floor(Math.random() * 899) + 101;
	};

	const formattedDate = new Date().toLocaleDateString('sv-SE', {
		weekday: 'long',
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});

	let number = $derived(getNumber($page.url.pathname));
	const currentYear = new Date().getFullYear();

	const websiteSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Blog',
		name: 'Ganhammar',
		description: 'Personal blog of Anton Ganhammar - Software development insights and experiments',
		url: 'https://ganhammar.se',
		author: {
			'@type': 'Person',
			name: 'Anton Ganhammar',
			url: 'https://ganhammar.se/about'
		}
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${websiteSchema}</script>`}
</svelte:head>

<header>
	<div class="info">
		<span>{number}</span>
		<span class="yellow">Ganhammar</span>
		<span>{formattedDate}</span>
	</div>
	<div class="banner">
		<h1><a href="/">Ganhammar</a></h1>
	</div>
	<nav class="main-nav">
		<a href="/" class:active={$page.url.pathname === '/'}>Posts</a>
		<a href="/about" class:active={$page.url.pathname === '/about'}>About</a>
		<a href="https://github.com/ganhammar" target="_blank" rel="noopener">GitHub</a>
	</nav>
</header>
<main>
	{@render children()}
</main>
<footer>
	<div class="content">
		<div class="footer-links">
			<a href="/about">About</a>
			<span class="separator">·</span>
			<a href="https://github.com/ganhammar" target="_blank" rel="noopener">GitHub</a>
		</div>
		<div class="copyright">Copyright &copy; 2023-{currentYear} Anton Ganhammar</div>
	</div>
</footer>

<style>
	.main-nav {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		padding: 0.75rem 0;
		border-bottom: 4px solid #ffff00;
		width: 600px;
		margin: 0 auto;
	}

	@media screen and (max-width: 660px) {
		.main-nav {
			width: 100%;
		}
	}

	.main-nav a {
		color: #ffff00;
		text-decoration: none;
	}

	.main-nav a:hover,
	.main-nav a.active {
		text-decoration: underline;
	}

	.footer-links {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.footer-links a {
		color: #ffff00;
		text-decoration: none;
	}

	.footer-links a:hover {
		text-decoration: underline;
	}

	.footer-links .separator {
		color: #ffff00;
	}

	.copyright {
		font-size: 0.9em;
	}
</style>
