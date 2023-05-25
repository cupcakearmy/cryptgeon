<script lang="ts" context="module">
	export type NoteResult = {
		id: string
		password?: string
	}
</script>

<script lang="ts">
	import { t } from 'svelte-intl-precompile'

	import Button from '$lib/ui/Button.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import Canvas from './Canvas.svelte'

	export let result: NoteResult

	let url = `${window.location.origin}/note/${result.id}`
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

<p>
	{@html $t('home.new_note_notice')}
</p>
<br />
<Button on:click={reset}>{$t('home.new_note')}</Button>

<style>
	div {
		width: min(12rem, 100%);
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
</style>
