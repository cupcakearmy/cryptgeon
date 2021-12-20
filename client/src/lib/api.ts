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

async function call(options: CallOptions) {
	return fetch('/api/' + options.url, {
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
		url: 'notes',
		method: 'post',
		body: note,
	})
	return data as { id: string }
}

export async function get(id: string) {
	const data = await call({
		url: `notes/${id}`,
		method: 'delete',
	})
	return data as NotePublic
}

export async function info(id: string) {
	const data = await call({
		url: `notes/${id}`,
		method: 'get',
	})
	return data as NoteInfo
}
