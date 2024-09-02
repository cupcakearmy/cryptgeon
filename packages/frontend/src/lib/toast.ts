import { toast } from '@zerodevx/svelte-toast'

export enum NotifyType {
	Success = 'success',
	Error = 'error',
}

const themeMapping: Record<NotifyType, Record<string, string>> = {
	[NotifyType.Success]: {
		'--toastBackground': 'var(--ui-clr-primary)',
		'--toastBarBackground': 'var(--ui-clr-primary-alt)',
	},
	[NotifyType.Error]: {
		'--toastBackground': 'var(--ui-clr-error)',
		'--toastBarBackground': 'var(--ui-clr-error-alt)',
	},
}

function notifyFN(message: string, type: NotifyType = NotifyType.Success) {
	const options = {
		duration: 5_000,
		theme: {
			...themeMapping[type],
			'--toastBarHeight': '0.25rem',
			'--toastMinHeight': 'auto',
			'--toastMsgPadding': '0.5rem',
			'--toastBorderRadius': '0',
		},
	}

	toast.push(message, options)
}

export const notify = {
	success: (message: string) => notifyFN(message, NotifyType.Success),
	error: (message: string) => notifyFN(message, NotifyType.Error),
}
