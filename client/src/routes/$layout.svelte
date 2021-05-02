<script lang="ts">
	import '../app.css'
	import Header from '$lib/Header/index.svelte'
</script>

<svelte:head>
	<title>cryptgeon</title>
</svelte:head>

<main>
	<Header />
	<slot />
</main>

<footer>
	<a href="/">/home</a>
	<a href="/about">/about</a>
	<a href="https://github.com/cupcakearmy/cryptgeon" target="_blank" rel="noopener">/code</a>
</footer>

<style>
	a {
		margin: 0 0.5rem;
	}
	main {
		padding: 1rem;
		padding-bottom: 4rem;
		width: 100%;
		max-width: 35rem;
		margin: 0 auto;
	}

	footer {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		padding: 1rem;
		position: fixed;
		bottom: 0;
		right: 0;
		width: 100%;
		background-color: var(--ui-bg-0-85);
	}
</style>
