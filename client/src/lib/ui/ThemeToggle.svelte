<script lang="ts" context="module">
	import { writable } from 'svelte/store'

	export enum Theme {
		Dark = 'dark',
		Light = 'light',
		Auto = 'auto',
	}

	const NextTheme = {
		[Theme.Auto]: Theme.Light,
		[Theme.Light]: Theme.Dark,
		[Theme.Dark]: Theme.Auto,
	}

	function init(): Theme {
		if (typeof window !== 'undefined') {
			const saved = window.localStorage.getItem('theme') as Theme
			if (Object.values(Theme).includes(saved)) return saved
		}
		return Theme.Auto
	}

	export const theme = writable<Theme>(init())

	theme.subscribe((theme) => {
		if (typeof window !== 'undefined') {
			window.localStorage.setItem('theme', theme)
			const html = window.document.getElementsByTagName('html')[0]
			html.setAttribute('theme', theme)
		}
	})
</script>

<script lang="ts">
	import Icon from '$lib/ui/Icon.svelte'

	function change() {
		theme.update((current) => NextTheme[current])
	}
</script>

<div on:click={change}>
	<Icon class="icon" icon="contrast-sharp" />
	{$theme}
</div>

<style>
	div :global(.icon) {
		height: 1rem;
		width: 1rem;
		margin-right: 0.5rem;
	}

	div {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		cursor: pointer;
	}
</style>
