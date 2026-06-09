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
	let hover_count = $state(0)

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

	async function onDrop(e: DragEvent) {
		e.preventDefault()
		// https://developer.mozilla.org/en-US/docs/Web/API/DragEvent/dataTransfer
		// "never null when dispatched by the browser"
		hover_count = 0
		if (e.dataTransfer!.items.length != 0) {
			const toAdd = await Promise.all(Array.from(e.dataTransfer!.files).map(fileToDTO))
			files = [...files, ...toAdd]
		}
	}

	function clear(e: Event) {
		e.preventDefault()
		files = []
	}
</script>

<svelte:window
	// cancels default browser behavior of downloading dragged file
	ondrop={(e: DragEvent) => {
		if ([...e.dataTransfer!.items].some((item) => item.kind === 'file')) {
			e.preventDefault()
		}
	}}
	ondragover={(e: DragEvent) => {
		e.preventDefault()
	}}
/>

<label>
	<small>
		{label}
	</small>
	<input {...rest} type="file" onchange={onInput} multiple />
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="box"
		class:file-drag={hover_count !== 0}
		ondrop={onDrop}
		ondragenter={() => hover_count++}
		ondragleave={() => hover_count--}
	>
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

	.box.file-drag {
		border-color: var(--ui-clr-primary);
	}

	.spacer {
		margin-top: 1rem;
	}
</style>
