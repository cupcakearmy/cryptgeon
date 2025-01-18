<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import { onMount } from 'svelte'
	import { waitLocale } from 'svelte-intl-precompile'

	import '../app.css'

	import { init as initStores, status } from '$lib/stores/status'
	import Footer from '$lib/views/Footer.svelte'
	import Header from '$lib/views/Header.svelte'
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()

	onMount(() => {
		initStores()
	})
</script>

<svelte:head>
	<title>{$status?.theme_page_title || 'cryptgeon'}</title>
	<link rel="icon" href={$status?.theme_favicon || '/favicon.png'} />
</svelte:head>

{#await waitLocale() then _}
	<main>
		<Header />
		{@render children?.()}
	</main>

	<SvelteToast />

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
