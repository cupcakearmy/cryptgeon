<script lang="ts">
	import type { FileDTO, NotePublic } from '$lib/api'
	import { Files } from '$lib/files'
	import copy from 'copy-to-clipboard'
	import { saveAs } from 'file-saver'
	import prettyBytes from 'pretty-bytes'
	import Button from './Button.svelte'

	export let note: NotePublic

	let files: FileDTO[] = []

	$: if (note.meta.type === 'file') {
		files = JSON.parse(note.contents) as FileDTO[]
	}

	$: download = () => {
		for (const file of files) {
			downloadFile(file)
		}
	}

	async function downloadFile(file: FileDTO) {
		const f = new File([await Files.fromString(file.contents)], file.name, {
			type: file.type,
		})
		saveAs(f)
	}
</script>

<p class="error-text">you will <b>not</b> get the chance to see the note again.</p>
{#if note.meta.type === 'text'}
	<div class="note" data-testid="note-result">
		{note.contents}
	</div>
	<Button on:click={() => copy(note.contents)}>copy to clipboard</Button>
{:else}
	{#each files as file}
		<div class="note file" data-testid="note-result">
			<b on:click={() => downloadFile(file)}>↓ {file.name}</b>
			<small> {file.type} － {prettyBytes(file.size)}</small>
		</div>
	{/each}
	<Button on:click={download}>download all</Button>
{/if}

<style>
	.note {
		width: 100%;
		margin: 0;
		padding: 0;
		border: 2px solid var(--ui-bg-1);
		outline: none;
		padding: 0.5rem;
		white-space: pre;
		overflow: auto;
		margin-bottom: 0.5rem;
	}

	.note b {
		cursor: pointer;
	}

	.note.file {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
