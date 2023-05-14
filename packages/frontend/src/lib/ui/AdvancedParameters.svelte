<script lang="ts">
	import { t } from 'svelte-intl-precompile'

	import { status } from '$lib/stores/status'
	import Switch from '$lib/ui/Switch.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import type { Note } from '@cryptgeon/shared'

	export let note: Note
	export let timeExpiration = false
</script>

<div class="fields">
	<TextInput
		data-testid="field-views"
		type="number"
		label={$t('common.views', { values: { n: 0 } })}
		bind:value={note.views}
		disabled={timeExpiration}
		max={$status?.max_views}
		min={1}
		validate={(v) =>
			($status && v <= $status?.max_views && v > 0) ||
			$t('home.errors.max', { values: { n: $status?.max_views ?? 0 } })}
	/>
	<div class="middle-switch">
		<Switch
			data-testid="switch-advanced-toggle"
			label={$t('common.mode')}
			bind:value={timeExpiration}
			color={false}
		/>
	</div>
	<TextInput
		data-testid="field-expiration"
		type="number"
		label={$t('common.minutes', { values: { n: 0 } })}
		bind:value={note.expiration}
		disabled={!timeExpiration}
		max={$status?.max_expiration}
		validate={(v) =>
			($status && v < $status?.max_expiration) ||
			$t('home.errors.max', { values: { n: $status?.max_expiration ?? 0 } })}
	/>
</div>

<style>
	.middle-switch {
		margin: 0 1rem;
	}

	.fields {
		display: flex;
	}
</style>
