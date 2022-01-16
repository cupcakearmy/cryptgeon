<script lang="ts" context="module">
	import { init, waitLocale, getLocaleFromNavigator } from 'svelte-intl-precompile'
	// @ts-ignore
	import { registerAll } from '$locales'
	registerAll()
	init({ initialLocale: getLocaleFromNavigator(), fallbackLocale: 'en' })
</script>

<script lang="ts">
	import { init as initStores } from '$lib/stores/status'
	import Footer from '$lib/views/Footer.svelte'
	import Header from '$lib/views/Header.svelte'
	import { onMount } from 'svelte'
	import '../app.css'

	onMount(() => {
		initStores()
	})
</script>

<svelte:head>
	<title>cryptgeon</title>
</svelte:head>

{#await waitLocale() then _}
	<main>
		<Header />
		<slot />
	</main>

	<Footer />
{/await}

<style>
	main {
		padding: 1rem;
		padding-bottom: 4rem;
		width: 100%;
		max-width: 35rem;
		margin: 0 auto;
	}
</style>
