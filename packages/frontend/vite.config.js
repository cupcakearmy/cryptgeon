import { sveltekit } from '@sveltejs/kit/vite'
import precompileIntl from 'svelte-intl-precompile/sveltekit-plugin'

/** @type {import('vite').UserConfig} */
const config = {
	clearScreen: false,
	server: {
		port: 3000,
	},
	plugins: [sveltekit(), precompileIntl('locales')],
}

export default config
