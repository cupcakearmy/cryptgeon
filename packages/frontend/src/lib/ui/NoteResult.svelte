<script lang="ts" module>
	export type NoteResult = {
		id: string
		password?: string
	}
</script>

<script lang="ts">
	import { t } from 'svelte-intl-precompile'
	import { status } from '$lib/stores/status'
	import Button from '$lib/ui/Button.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import Canvas from './Canvas.svelte'

	interface Props {
		result: NoteResult
	}

	let { result }: Props = $props()

	let url = $state(`${window.location.origin}/note/${result.id}`)
	if (result.password) url += `#${result.password}`

	function reset() {
		window.location.reload()
	}
</script>

<TextInput
	type="text"
	readonly
	label={$t('common.share_link')}
	value={url}
	copy
	data-testid="share-link"
/>

<div>
	<Canvas value={url} />
</div>

{#if $status?.theme_new_note_notice}
	<p>
		{@html $t('home.new_note_notice')}
	</p>
{/if}
<br />
<Button onclick={reset}>{$t('home.new_note')}</Button>

<style>
	div {
		width: min(12rem, 100%);
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
</style>
