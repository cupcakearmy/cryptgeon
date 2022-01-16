<script lang="ts">
	import { status } from '$lib/stores/status'
	import prettyBytes from 'pretty-bytes'
	import { _ } from 'svelte-intl-precompile'
</script>

<span>
	{#if $status !== null}
		{prettyBytes($status.max_size, { binary: true })}
	{:else}
		{$_('common.loading')}
	{/if}
</span>
