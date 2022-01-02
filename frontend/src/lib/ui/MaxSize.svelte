<script lang="ts">
	import { status } from '$lib/stores/status'
	import prettyBytes from 'pretty-bytes'
</script>

<span>
	{#if $status !== null}
		{prettyBytes($status.max_size, { binary: true })}
	{:else}
		loading...
	{/if}
</span>
