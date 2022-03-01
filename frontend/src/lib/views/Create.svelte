<script lang="ts">
	import { create, Note, PayloadToLargeError } from '$lib/api'
	import { encrypt, getKeyFromString, getRandomBytes, Hex } from '$lib/crypto'
	import Button from '$lib/ui/Button.svelte'
	import FileUpload from '$lib/ui/FileUpload.svelte'
	import MaxSize from '$lib/ui/MaxSize.svelte'
	import Switch from '$lib/ui/Switch.svelte'
	import TextArea from '$lib/ui/TextArea.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import { blur } from 'svelte/transition'
	import { t } from 'svelte-intl-precompile'

	let note: Note = {
		contents: '',
		meta: { type: 'text' },
		views: 1,
		expiration: 60,
	}
	let result: { password: string; id: string } | null = null
	let advanced = false
	let file = false
	let timeExpiration = false
	let message = ''
	let loading = false
	let error: string | null = null

	$: if (!advanced) {
		note.views = 1
		timeExpiration = false
	}

	$: {
		message = $t('home.explanation', {
			values: {
				type: $t(timeExpiration ? 'common.minutes' : 'common.views', {
					values: { n: (timeExpiration ? note.expiration : note.views) ?? '?' },
				}),
			},
		})
	}

	$: note.meta.type = file ? 'file' : 'text'

	$: if (!file) {
		note.contents = ''
	}

	async function submit() {
		try {
			error = null
			loading = true
			const password = Hex.encode(getRandomBytes(32))
			const key = await getKeyFromString(password)
			const data: Note = {
				contents: await encrypt(note.contents, key),
				meta: note.meta,
			}
			if (timeExpiration) data.expiration = parseInt(note.expiration as any)
			else data.views = parseInt(note.views as any)

			const response = await create(data)
			result = {
				password: password,
				id: response.id,
			}
		} catch (e) {
			if (e instanceof PayloadToLargeError) {
				error = $t('home.errors.note_to_big')
			} else {
				error = $t('home.errors.note_error')
			}
		} finally {
			loading = false
		}
	}

	function reset() {
		window.location.reload()
	}
</script>

{#if result}
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
{:else}
	<p>
		{@html $t('home.intro')}
	</p>
	<form on:submit|preventDefault={submit}>
		<fieldset disabled={loading}>
			{#if file}
				<FileUpload label={$t('common.file')} on:file={(f) => (note.contents = f.detail)} />
			{:else}
				<TextArea label={$t('common.note')} bind:value={note.contents} placeholder="..." />
			{/if}

			<div class="bottom">
				<Switch class="file" label={$t('common.file')} bind:value={file} />
				<Switch label={$t('common.advanced')} bind:value={advanced} />
				<div class="grow" />
				<div class="tr">
					<small>{$t('common.max')}: <MaxSize /> </small>
					<br />
					<Button type="submit">{$t('common.create')}</Button>
				</div>
			</div>

			{#if error}
				<div class="error-text">{error}</div>
			{/if}

			<p>
				<br />
				{#if loading}
					{$t('common.loading')}
				{:else}
					{message}
				{/if}
			</p>

			{#if advanced}
				<div transition:blur={{ duration: 250 }}>
					<br />
					<div class="fields">
						<TextInput
							type="number"
							label={$t('common.views', { values: { n: 0 } })}
							bind:value={note.views}
							disabled={timeExpiration}
							max={100}
						/>
						<div class="middle-switch">
							<Switch label={$t('common.mode')} bind:value={timeExpiration} color={false} />
						</div>
						<TextInput
							type="number"
							label={$t('common.minutes', { values: { n: 0 } })}
							bind:value={note.expiration}
							disabled={!timeExpiration}
							max={360}
						/>
					</div>
				</div>
			{/if}
		</fieldset>
	</form>
{/if}

<style>
	.bottom {
		display: flex;
		align-items: flex-end;
		margin-top: 0.5rem;
	}

	.bottom :global(.file) {
		margin-right: 0.5rem;
	}

	.grow {
		flex: 1;
	}

	.middle-switch {
		margin: 0 1rem;
	}

	.error-text {
		margin-top: 0.5rem;
	}

	.fields {
		display: flex;
	}
</style>
