import { call } from '$lib/api'
import { writable } from 'svelte/store'

export type Status = {
	version: string
	max_size: number
}

export const status = writable<null | Status>(null)

export async function init() {
	const data = await call({
		url: 'status',
		method: 'get',
	})
	status.set(data)
}
