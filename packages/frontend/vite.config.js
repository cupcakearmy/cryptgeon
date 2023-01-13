import { sveltekit } from '@sveltejs/kit/vite'
import precompileIntl from 'svelte-intl-precompile/sveltekit-plugin'

const port = 8001

/** @type {import('vite').UserConfig} */
const config = {
	clearScreen: false,
	server: { port },
	preview: { port },
	plugins: [sveltekit(), precompileIntl('locales')],
}

export default config
