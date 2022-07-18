<script lang="ts">
	import prettyBytes from 'pretty-bytes'
	import { _ } from 'svelte-intl-precompile'

	import { status } from '$lib/stores/status'

	// Due to encoding overhead (~35%) with base64
	// https://en.wikipedia.org/wiki/Base64
	const overhead = 1 / 1.35
</script>

<span>
	{#if $status !== null}
		{prettyBytes($status.max_size * overhead, { binary: true })}
	{:else}
		{$_('common.loading')}
	{/if}
</span>
