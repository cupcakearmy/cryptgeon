<script lang="ts" module>
	import { writable } from 'svelte/store'

	const themes = ['dark', 'light', 'auto'] as const
	type Theme = (typeof themes)[number]

	const NextTheme: Record<Theme, Theme> = {
		auto: 'light',
		light: 'dark',
		dark: 'auto',
	}

	function init(): Theme {
		if (typeof window !== 'undefined') {
			const saved = window.localStorage.getItem('theme') as Theme
			if (themes.includes(saved)) return saved
		}
		return 'auto'
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

<button onclick={change}>
	<Icon class="icon" icon="contrast" />
	{$theme}
</button>

<style>
	button :global(.icon) {
		height: 1rem;
		width: 1rem;
		margin-right: 0.5rem;
	}

	button {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		cursor: pointer;
	}
</style>
