import type { EncryptedFileDTO, FileDTO } from './api'
import { Crypto } from './crypto'

abstract class CryptAdapter<T> {
	abstract encrypt(plaintext: T, key: CryptoKey): Promise<string>
	abstract decrypt(ciphertext: string, key: CryptoKey): Promise<T>
}

class CryptTextAdapter implements CryptAdapter<string> {
	async encrypt(plaintext: string, key: CryptoKey) {
		return await Crypto.encrypt(new TextEncoder().encode(plaintext), key)
	}
	async decrypt(ciphertext: string, key: CryptoKey) {
		const plaintext = await Crypto.decrypt(ciphertext, key)
		return new TextDecoder().decode(plaintext)
	}
}

class CryptBlobAdapter implements CryptAdapter<Blob> {
	async encrypt(plaintext: Blob, key: CryptoKey) {
		return await Crypto.encrypt(await plaintext.arrayBuffer(), key)
	}

	async decrypt(ciphertext: string, key: CryptoKey) {
		const plaintext = await Crypto.decrypt(ciphertext, key)
		return new Blob([plaintext], { type: 'application/octet-stream' })
	}
}

class CryptFilesAdapter implements CryptAdapter<FileDTO[]> {
	async encrypt(plaintext: FileDTO[], key: CryptoKey) {
		const adapter = new CryptBlobAdapter()
		const data: Promise<EncryptedFileDTO>[] = plaintext.map(async (file) => ({
			name: file.name,
			size: file.size,
			type: file.type,
			contents: await adapter.encrypt(file.contents, key),
		}))
		return JSON.stringify(await Promise.all(data))
	}

	async decrypt(ciphertext: string, key: CryptoKey) {
		const adapter = new CryptBlobAdapter()
		const data: EncryptedFileDTO[] = JSON.parse(ciphertext)
		const files: FileDTO[] = await Promise.all(
			data.map(async (file) => ({
				name: file.name,
				size: file.size,
				type: file.type,
				contents: await adapter.decrypt(file.contents, key),
			}))
		)
		return files
	}
}

export const Adapters = {
	Text: new CryptTextAdapter(),
	Blob: new CryptBlobAdapter(),
	Files: new CryptFilesAdapter(),
}
