import { status as apiStatus } from '@cryptgeon/shared'
import { writable } from 'svelte/store'

export type StatusInfo = {
	version: string
	max_size: number
	max_views: number
	max_expiration: number
	allow_advanced: boolean
	allow_files: boolean
	imprint_url: string
	imprint_html: string
	theme_image: string
	theme_text: string
	theme_page_title: string
	theme_favicon: string
	theme_new_note_notice: boolean
	theme_home_link: boolean
}

export const status = writable<null | StatusInfo>(null)

export async function init() {
	status.set((await apiStatus()) as StatusInfo)
}