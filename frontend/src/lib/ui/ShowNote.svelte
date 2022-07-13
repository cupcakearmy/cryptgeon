<script lang="ts">
	import type { FileDTO, NotePublic } from '$lib/api'
	import { Files } from '$lib/files'
	import copy from 'copy-to-clipboard'
	import DOMPurify from 'dompurify'
	import { saveAs } from 'file-saver'
	import prettyBytes from 'pretty-bytes'
	import { t } from 'svelte-intl-precompile'
	import Button from './Button.svelte'

	export let note: NotePublic

	const RE_URL = /[A-Za-z]+:\/\/([A-Z a-z0-9\-._~:\/?#\[\]@!$&'()*+,;%=])+/g
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

	function contentWithLinks(content: string): string {
		const replaced = content.replace(
			RE_URL,
			(url) => `<a href="${url}" rel="noreferrer">${url}</a>`
		)
		return DOMPurify.sanitize(replaced, { USE_PROFILES: { html: true } })
	}
</script>

<p class="error-text">{@html $t('show.warning_will_not_see_again')}</p>
{#if note.meta.type === 'text'}
	<div class="note">
		{@html contentWithLinks(note.contents)}
	</div>
	<Button on:click={() => copy(note.contents)}>{$t('common.copy_clipboard')}</Button>
{:else}
	{#each files as file}
		<div class="note file">
			<b on:click={() => downloadFile(file)}>↓ {file.name}</b>
			<small> {file.type} － {prettyBytes(file.size)}</small>
		</div>
	{/each}
	<Button on:click={download}>{$t('show.download_all')}</Button>
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
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.note.file {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.note.file small {
		padding-left: 1rem;
	}
</style>
