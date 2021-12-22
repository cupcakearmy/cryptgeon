<script lang="ts">
	export let title: string
</script>

<p>
	<b>▶ {title}</b>
	<slot />
</p>

<style>
	b {
		display: block;
		margin-bottom: 0.25rem;
	}

	p > :global(span) {
		padding-left: 1.25em;
	}
</style>
