<script lang="ts" context="module">
	export type NoteResult = {
		password: string
		id: string
	}
</script>

<script lang="ts">
	import { t } from 'svelte-intl-precompile'

	import Button from '$lib/ui/Button.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'

	export let result: NoteResult

	function reset() {
		window.location.reload()
	}
</script>

<TextInput
	type="text"
	readonly
	label={$t('common.share_link')}
	value="{window.location.origin}/note/{result.id}#{result.password}"
	copy
/>
<br />
<p>
	{@html $t('home.new_note_notice')}
</p>
<br />
<Button on:click={reset}>{$t('home.new_note')}</Button>

<style>
</style>
