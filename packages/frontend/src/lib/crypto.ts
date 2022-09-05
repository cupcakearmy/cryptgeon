export class Hex {
	static encode(buffer: ArrayBuffer): string {
		let s = ''
		for (const i of new Uint8Array(buffer)) {
			s += i.toString(16).padStart(2, '0')
		}
		return s
	}

	static decode(s: string): ArrayBuffer {
		const size = s.length / 2
		const buffer = new Uint8Array(size)
		for (let i = 0; i < size; i++) {
			const idx = i * 2
			const segment = s.slice(idx, idx + 2)
			buffer[i] = parseInt(segment, 16)
		}
		return buffer
	}
}

export class ArrayBufferUtils {
	static async toString(buffer: ArrayBuffer): Promise<string> {
		const reader = new window.FileReader()
		reader.readAsDataURL(new Blob([buffer]))
		return new Promise((resolve) => {
			reader.onloadend = () => resolve(reader.result as string)
		})
	}

	static async fromString(s: string): Promise<ArrayBuffer> {
		return fetch(s)
			.then((r) => r.blob())
			.then((b) => b.arrayBuffer())
	}
}

export class Crypto {
	private static ALG = 'AES-GCM'
	private static DELIMITER = ':::'

	public static getRandomBytes(size: number): Uint8Array {
		return window.crypto.getRandomValues(new Uint8Array(size))
	}

	public static getKeyFromString(password: string) {
		return window.crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(password),
			'PBKDF2',
			false,
			['deriveBits', 'deriveKey']
		)
	}
	public static async getDerivedForKey(key: CryptoKey, salt: ArrayBuffer) {
		const iterations = 100_000
		return window.crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations,
				hash: 'SHA-512',
			},
			key,
			{ name: this.ALG, length: 256 },
			true,
			['encrypt', 'decrypt']
		)
	}

	public static async encrypt(plaintext: ArrayBuffer, key: CryptoKey): Promise<string> {
		const salt = this.getRandomBytes(16)
		const derived = await this.getDerivedForKey(key, salt)
		const iv = this.getRandomBytes(16)
		const encrypted: ArrayBuffer = await window.crypto.subtle.encrypt(
			{ name: this.ALG, iv },
			derived,
			plaintext
		)
		const data = [
			Hex.encode(salt),
			Hex.encode(iv),
			await ArrayBufferUtils.toString(encrypted),
		].join(this.DELIMITER)
		return data
	}

	public static async decrypt(ciphertext: string, key: CryptoKey): Promise<ArrayBuffer> {
		const splitted = ciphertext.split(this.DELIMITER)
		const salt = Hex.decode(splitted[0])
		const iv = Hex.decode(splitted[1])
		const encrypted = await ArrayBufferUtils.fromString(splitted[2])
		const derived = await this.getDerivedForKey(key, salt)
		const plaintext = await window.crypto.subtle.decrypt({ name: this.ALG, iv }, derived, encrypted)
		return plaintext
	}
}
