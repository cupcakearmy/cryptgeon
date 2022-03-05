import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static'
import precompileIntl from 'svelte-intl-precompile/sveltekit-plugin'

export default {
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
			fallback: 'index.html',
		}),
		vite: {
			plugins: [
				precompileIntl('locales'), // if your translations are defined in /locales/[lang].json
			],
		},
	},
}
