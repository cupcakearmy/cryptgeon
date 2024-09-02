import { t } from 'svelte-intl-precompile'
import { get } from 'svelte/store'

import { notify } from './toast'

export function copy(value: string) {
	window.navigator.clipboard.writeText(value)
	const msg = get(t)('common.copied_to_clipboard')
	notify.success(msg)
}

export function getCSSVariable(variable: string): string {
	if (typeof window === 'undefined') return ''
	return window.getComputedStyle(window.document.body).getPropertyValue(variable)
}
