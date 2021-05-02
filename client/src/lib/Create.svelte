<script lang="ts">
	import type { Note } from '$lib/api'
	import { create } from '$lib/api'
	import { getKeyFromString, encrypt } from '$lib/crypto'

	import Button from './ui/Button.svelte'
	import Switch from './ui/Switch.svelte'
	import TextArea from './ui/TextArea.svelte'
	import TextInput from './ui/TextInput.svelte'

	let note: Note = {
		contents: 'secret',
		password: false,
		views: 1,
		expiration: 60,
	}
	let password: string = ''
	let result: { password: string; id: string } | null = null
	let advanced = false
	let type = false
	let loading = false
	let message = ''

	$: if (!advanced) {
		note.views = 1
		type = false
	}

	$: {
		let fraction: string
		fraction = type ? `${note.expiration} minutes` : `${note.views} views`
		message = 'the note will expire and be destroyed after ' + fraction
	}

	async function submit() {
		try {
			loading = true
			const data: Note = {
				contents: note.contents,
				password: !!password,
			}
			// @ts-ignore
			if (type) data.expiration = parseInt(note.expiration)
			// @ts-ignore
			else data.views = parseInt(note.views)
			if (data.password) {
				const key = await getKeyFromString(password)
				data.contents = await encrypt(data.contents, key)
			}

			const response = await create(data)
			result = {
				password: password,
				id: response.id,
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
	{#if result.password}
		<TextInput type="password" readonly value={result.password} copy />
		<br />
	{/if}
	<TextInput type="text" readonly value="{window.location.origin}/note/{result.id}" copy />
	<br />
	<Button on:click={reset}>new</Button>
{:else}
	<form on:submit|preventDefault={submit}>
		<fieldset disabled={loading}>
			<TextArea label="note" bind:value={note.contents} />

			<div class="bottom">
				<Switch label="advanced" bind:value={advanced} />
				<Button type="submit">create</Button>
			</div>

			<p><br />{message}</p>

			<div class="advanced" class:hidden={!advanced}>
				<br />
				<div class="fields">
					<TextInput
						type="number"
						label="views"
						bind:value={note.views}
						disabled={type}
						max={100}
					/>
					<div class="middle-switch">
						<Switch label="mode" bind:value={type} color={false} />
					</div>
					<TextInput
						type="number"
						label="minutes"
						bind:value={note.expiration}
						disabled={!type}
						max={360}
					/>
				</div>
				<br />
				<TextInput
					type="password"
					label="password"
					placeholder="optional"
					bind:value={password}
					copy
					random
				/>
			</div>

			<style>
				.fields {
					display: flex;
				}
				.spacer {
					width: 3rem;
				}
			</style>
		</fieldset>
	</form>
{/if}

<style>
	.bottom {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: 0.5rem;
	}

	.middle-switch {
		margin: 0 1rem;
	}

	.advanced {
		max-height: 14em;
		overflow: hidden;
		transition: var(--ui-anim);
	}

	.advanced.hidden {
		max-height: 0;
	}
</style>
