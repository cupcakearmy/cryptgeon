import adapter from '@sveltejs/adapter-static'
import precompileIntl from 'svelte-intl-precompile/sveltekit-plugin'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
	preprocess: vitePreprocess([precompileIntl('locales')]),
	kit: {
		adapter: adapter({
			fallback: 'index.html',
		}),
	},
}
