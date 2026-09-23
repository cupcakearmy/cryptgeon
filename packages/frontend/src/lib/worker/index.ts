import { wrap } from 'comlink'

import CryptWorker from './worker?worker'
import type { packContent, unpackContent } from '@cryptgeon/shared'

export function createWorker() {
	const worker = new CryptWorker()
	return wrap<WorkerConract>(worker)
}

export type WorkerConract = {
	pack: typeof packContent
	unpack: typeof unpackContent
}
