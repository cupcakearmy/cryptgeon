import { dev } from '$app/env'

export type Note = {
	contents: string
	views?: number
	expiration?: number
}
export type NoteInfo = {}
export type NotePublic = Pick<Note, 'contents'>

type CallOptions = {
	url: string
	method: string
	body?: any
}
const base = dev ? 'http://localhost:5000' : undefined
async function call(options: CallOptions) {
	return fetch(base + options.url, {
		method: options.method,
		body: options.body === undefined ? undefined : JSON.stringify(options.body),
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((r) => r.json())
}

export async function create(note: Note) {
	const data = await call({
		url: '/api/notes',
		method: 'post',
		body: note,
	})
	return data as { id: string }
}

export async function get(id: string) {
	const data = await call({
		url: `/api/notes/${id}`,
		method: 'delete',
	})
	return data as NotePublic
}

export async function info(id: string) {
	const data = await call({
		url: `/api/notes/${id}`,
		method: 'get',
	})
	return data as NoteInfo
}
