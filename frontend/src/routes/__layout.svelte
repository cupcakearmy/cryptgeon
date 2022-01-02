<script lang="ts">
	import { init } from '$lib/stores/status'
	import Footer from '$lib/views/Footer.svelte'
	import Header from '$lib/views/Header.svelte'
	import { onMount } from 'svelte'
	import '../app.css'

	onMount(() => {
		init()
	})
</script>

<svelte:head>
	<title>cryptgeon</title>
</svelte:head>

<main>
	<Header />
	<slot />
</main>

<Footer />

<style>
	main {
		padding: 1rem;
		padding-bottom: 4rem;
		width: 100%;
		max-width: 35rem;
		margin: 0 auto;
	}
</style>
