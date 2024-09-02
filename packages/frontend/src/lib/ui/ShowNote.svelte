<script lang="ts" context="module">
	export type DecryptedNote = Omit<NotePublic, 'contents'> & { contents: any }

	function saveAs(file: File) {
		const url = window.URL.createObjectURL(file)
		const a = document.createElement('a')
		a.style.display = 'none'
		a.href = url
		a.download = file.name
		document.body.appendChild(a)
		a.click()
		window.URL.revokeObjectURL(url)
		a.remove()
	}
</script>

<script lang="ts">
	import prettyBytes from 'pretty-bytes'
	import { t } from 'svelte-intl-precompile'

	import Button from '$lib/ui/Button.svelte'
	import { copy } from '$lib/utils'
	import type { FileDTO, NotePublic } from 'cryptgeon/shared'

	export let note: DecryptedNote

	const RE_URL = /[A-Za-z]+:\/\/([A-Z a-z0-9\-._~:\/?#\[\]@!$&'()*+,;%=])+/g
	let files: FileDTO[] = []

	$: if (note.meta.type === 'file') {
		files = note.contents
	}

	$: download = () => {
		for (const file of files) {
			downloadFile(file)
		}
	}

	async function downloadFile(file: FileDTO) {
		const f = new File([file.contents], file.name, {
			type: file.type,
		})
		saveAs(f)
	}

	$: links = typeof note.contents === 'string' ? note.contents.match(RE_URL) : []
</script>

<p class="error-text">{@html $t('show.warning_will_not_see_again')}</p>
<div data-testid="result">
	{#if note.meta.type === 'text'}
		<div class="note">
			{note.contents}
		</div>
		<Button on:click={() => copy(note.contents)}>{$t('common.copy_clipboard')}</Button>

		{#if links && links.length}
			<div class="links">
				{$t('show.links_found')}
				<ul>
					{#each links as link}
						<li>
							<a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	{:else}
		{#each files as file}
			<div class="note file">
				<button on:click={() => downloadFile(file)}>
					<b>↓ {file.name}</b>
				</button>
				<small> {file.type} － {prettyBytes(file.size)}</small>
			</div>
		{/each}
		<Button on:click={download}>{$t('show.download_all')}</Button>
	{/if}
</div>

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

	.links {
		margin-top: 2rem;
	}
	.links ul {
		margin: 0;
		padding: 0;
		margin-top: 0.5rem;
		padding-left: 1rem;
		list-style: square;
	}

	.links ul li {
		margin-bottom: 0.5rem;
		word-wrap: break-word;
	}
</style>
