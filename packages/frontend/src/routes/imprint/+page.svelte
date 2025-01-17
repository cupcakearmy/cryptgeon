<script lang="ts">
	import { goto } from '$app/navigation'
	import { status } from '$lib/stores/status'

	status.subscribe((config) => {
		if (config != null) {
			if (config.imprint_url) {
				window.location.href = config.imprint_url
			} else if (config.imprint_html == '') {
				goto('/about')
			}
		}
	})
</script>

<svelte:head>
	<title>Imprint</title>
</svelte:head>

<section class="content">
	{#if $status?.imprint_html}
		{@html $status.imprint_html}
	{/if}
</section>

<style>
	section {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
</style>
