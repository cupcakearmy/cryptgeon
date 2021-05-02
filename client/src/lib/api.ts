import axios from 'axios'
import { dev } from '$app/env'

const base = axios.create({ baseURL: dev ? 'http://localhost:5000' : undefined })

export type Note = {
	contents: string
	password: boolean
	views?: number
	expiration?: number
}
export type NoteInfo = Pick<Note, 'password'>
export type NotePublic = Pick<Note, 'contents'>

export async function create(note: Note) {
	const { data } = await base({
		url: '/api/notes',
		method: 'post',
		data: note,
	})
	return data as { id: string }
}

export async function get(id: string) {
	const { data } = await base({
		url: `/api/notes/${id}`,
		method: 'delete',
	})
	return data as NotePublic
}

export async function info(id: string) {
	const { data } = await base({
		url: `/api/notes/${id}`,
		method: 'get',
	})
	return data as NoteInfo
}
