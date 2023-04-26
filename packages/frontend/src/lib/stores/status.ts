import { status as getStatus, type Status } from '@cryptgeon/shared'
import { writable } from 'svelte/store'

export const status = writable<null | Status>(null)

export async function init() {
	status.set(await getStatus())
}
