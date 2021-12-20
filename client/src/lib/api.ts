export type NoteMeta = { type: 'text' | 'file' }

export type Note = {
	contents: string
	meta: NoteMeta
	views?: number
	expiration?: number
}
export type NoteInfo = {}
export type NotePublic = Pick<Note, 'contents' | 'meta'>
export type NoteCreate = Omit<Note, 'meta'> & { meta: string }

export type FileDTO = Pick<File, 'name' | 'size' | 'type'> & {
	contents: string
}

type CallOptions = {
	url: string
	method: string
	body?: any
}

export class PayloadToLargeError extends Error {}

async function call(options: CallOptions) {
	const response = await fetch('/api/' + options.url, {
		method: options.method,
		body: options.body === undefined ? undefined : JSON.stringify(options.body),
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		if (response.status === 413) throw new PayloadToLargeError()
		else throw new Error('API call failed')
	}
	return response.json()
}

export async function create(note: Note) {
	const { meta, ...rest } = note
	const body: NoteCreate = {
		...rest,
		meta: JSON.stringify(meta),
	}
	const data = await call({
		url: 'notes',
		method: 'post',
		body,
	})
	return data as { id: string }
}

export async function get(id: string): Promise<NotePublic> {
	const data = await call({
		url: `notes/${id}`,
		method: 'delete',
	})
	const { contents, meta } = data
	return {
		contents,
		meta: JSON.parse(meta) as NoteMeta,
	}
}

export async function info(id: string): Promise<NoteInfo> {
	const data = await call({
		url: `notes/${id}`,
		method: 'get',
	})
	return data
}
