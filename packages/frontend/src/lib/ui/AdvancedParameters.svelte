<script lang="ts">
	import { t } from 'svelte-intl-precompile'

	import { status } from '$lib/stores/status'
	import Switch from '$lib/ui/Switch.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import type { Note } from 'cryptgeon/shared'

	interface Props {
		note: Note
		timeExpiration?: boolean
		customPassword?: string | null
	}

	let {
		note = $bindable(),
		timeExpiration = $bindable(false),
		customPassword = $bindable(null),
	}: Props = $props()

	let hasCustomPassword = $state(false)

	$effect(() => {
		if (!hasCustomPassword) customPassword = null
	})

	let disableModSwitch = $status && $status?.disable_mode_switch
</script>

<div class="flex col">
	<div class="flex">
		<TextInput
			data-testid="field-views"
			type="number"
			label={$t('common.views', { values: { n: 0 } })}
			bind:value={note.views}
			disabled={timeExpiration && !disableModSwitch}
			max={$status?.max_views}
			min={1}
			validate={(v) =>
				($status && v <= $status?.max_views && v > 0) ||
				$t('home.errors.max', { values: { n: $status?.max_views ?? 0 } })}
		/>
		{#if !disableModSwitch}
		<Switch
			data-testid="switch-advanced-toggle"
			label={$t('common.mode')}
			bind:value={timeExpiration}
			color={false}
		/>
		{/if}
		<TextInput
			data-testid="field-expiration"
			type="number"
			label={$t('common.minutes', { values: { n: 0 } })}
			bind:value={note.expiration}
			disabled={!timeExpiration && !disableModSwitch}
			max={$status?.max_expiration}
			validate={(v) =>
				// Use <= insteaad of < to avoid error message when value is equals to max.
				($status && v <= $status?.max_expiration) ||
				$t('home.errors.max', { values: { n: $status?.max_expiration ?? 0 } })}
		/>
	</div>
	<div class="flex">
		<Switch
			data-testid="custom-password"
			bind:value={hasCustomPassword}
			label={$t('home.advanced.custom_password')}
		/>
		<TextInput
			data-testid="password"
			type="password"
			bind:value={customPassword}
			label={$t('common.password')}
			disabled={!hasCustomPassword}
			random
		/>
	</div>
	<div>
		{$t('home.advanced.explanation')}
	</div>
</div>

<style>
	.flex {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		width: 100%;
	}

	.col {
		gap: 1.5rem;
		flex-direction: column;
	}
</style>
