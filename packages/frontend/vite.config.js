import { sveltekit } from '@sveltejs/kit/vite'
import precompileIntl from 'svelte-intl-precompile/sveltekit-plugin'
import { defineConfig } from 'vite'

const port = 3000

export default defineConfig({
	clearScreen: false,
	server: {
		port,
		proxy: {
			'/api': 'http://localhost:8000',
		},
	},
	preview: { port },
	plugins: [sveltekit(), precompileIntl('locales')],
})
