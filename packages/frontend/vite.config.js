import { sveltekit } from '@sveltejs/kit/vite'
import precompileIntl from 'svelte-intl-precompile/sveltekit-plugin'

const port = 3000

/** @type {import('vite').UserConfig} */
const config = {
	clearScreen: false,
	server: {
		port,
		proxy: {
			'/api': 'http://localhost:8000',
		},
	},
	preview: { port },
	plugins: [sveltekit(), precompileIntl('locales')],
}

export default config
