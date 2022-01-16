<script lang="ts">
	import ThemeToggle from '$lib/ui/ThemeToggle.svelte'
	import { t } from 'svelte-intl-precompile'
</script>

<footer>
	<ThemeToggle />
	<nav>
		<a href="/">/{$t('nav.home')}</a>
		<a href="/about">/{$t('nav.about')}</a>
		<a href="https://github.com/cupcakearmy/cryptgeon" target="_blank" rel="noopener"
			>/{$t('nav.code')}</a
		>
	</nav>
</footer>

<style>
	footer {
		display: flex;
		justify-content: space-between;
		padding: 1rem;
		position: fixed;
		bottom: 0;
		right: 0;
		width: 100%;
		background-color: var(--ui-bg-0-85);
	}

	a {
		margin: 0 0.5rem;
	}

	nav {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
	}
</style>
