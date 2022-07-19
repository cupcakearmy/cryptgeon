<script lang="ts">
	import { t } from 'svelte-intl-precompile'

	import type { FileDTO } from '$lib/api'
	import Button from '$lib/ui/Button.svelte'
	import MaxSize from '$lib/ui/MaxSize.svelte'

	export let label: string = ''
	export let files: FileDTO[] = []

	function fileToDTO(file: File): FileDTO {
		return {
			name: file.name,
			size: file.size,
			type: file.type,
			contents: file,
		}
	}

	async function onInput(e: Event) {
		const input = e.target as HTMLInputElement
		if (input?.files?.length) {
			files = [...files, ...Array.from(input.files).map(fileToDTO)]
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
	<input type="file" on:change={onInput} multiple />
	<div class="box">
		{#if files.length}
			<div>
				<b>{$t('file_upload.selected_files')}</b>
				{#each files as file}
					<div class="file">
						{file.name}
					</div>
				{/each}
				<div class="spacer" />
				<Button on:click={clear}>Clear</Button>
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
