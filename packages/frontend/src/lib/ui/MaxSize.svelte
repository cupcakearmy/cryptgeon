<script lang="ts">
	import prettyBytes from 'pretty-bytes'
	import { _ } from 'svelte-intl-precompile'

	import { status } from '$lib/stores/status'

	// Payload is raw bytes (msgpack + cipher), no base64 padding overhead.
</script>

<span>
	{#if $status !== null}
		{prettyBytes($status.max_size, { binary: true })}
	{:else}
		{$_('common.loading')}
	{/if}
</span>
