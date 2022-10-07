import copyToClipboard from 'copy-to-clipboard'
import { t } from 'svelte-intl-precompile'
import { get } from 'svelte/store'

import { notify } from './toast'

export function copy(value: string) {
	copyToClipboard(value)
	const msg = get(t)('common.copied_to_clipboard')
	notify.success(msg)
}
