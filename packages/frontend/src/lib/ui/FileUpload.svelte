<script lang="ts">
	import { t } from 'svelte-intl-precompile'

	import Button from '$lib/ui/Button.svelte'
	import MaxSize from '$lib/ui/MaxSize.svelte'
	import type { FileDTO } from 'cryptgeon/shared'

	interface Props {
		label?: string
		files?: FileDTO[]
		[key: string]: any
	}

	let { label = '', files = $bindable([]), ...rest }: Props = $props()

	async function fileToDTO(file: File): Promise<FileDTO> {
		return {
			name: file.name,
			size: file.size,
			type: file.type,
			contents: new Uint8Array(await file.arrayBuffer()),
		}
	}

	async function onInput(e: Event) {
		const input = e.target as HTMLInputElement
		if (input?.files?.length) {
			const toAdd = await Promise.all(Array.from(input.files).map(fileToDTO))
			files = [...files, ...toAdd]
		}
	}

	function clear(e: Event) {
		e.preventDefault()
		files = []
	}
</script>

<label>
	<small>
		{label}
	</small>
	<input {...rest} type="file" onchange={onInput} multiple />
	<div class="box">
		{#if files.length}
			<div>
				<b>{$t('file_upload.selected_files')}</b>
				{#each files as file}
					<div class="file">
						{file.name}
					</div>
				{/each}
				<div class="spacer"></div>
				<Button onclick={clear}>{$t('file_upload.clear')}</Button>
			</div>
		{:else}
			<div>
				<b>{$t('file_upload.no_files_selected')}</b>
				<br />
				<small>
					{$t('common.max')}: <MaxSize />
				</small>
			</div>
		{/if}
	</div>
</label>

<style>
	input {
		display: none;
	}

	.box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}

	.spacer {
		margin-top: 1rem;
	}
</style>
