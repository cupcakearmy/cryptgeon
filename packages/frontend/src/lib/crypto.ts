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

export class Keys {
	public static async generateKey(size: 128 | 192 | 256 = 256): Promise<CryptoKey> {
		const key = await window.crypto.subtle.generateKey(
			{
				name: 'AES-GCM',
				length: size,
			},
			true,
			['encrypt', 'decrypt']
		)
		return key
	}

	public static async export(key: CryptoKey): Promise<string> {
		return Hex.encode(await window.crypto.subtle.exportKey('raw', key))
	}

	public static async import(key: string): Promise<CryptoKey> {
		return window.crypto.subtle.importKey('raw', Hex.decode(key), { name: 'AES-GCM' }, true, [
			'encrypt',
			'decrypt',
		])
	}
}

export class Crypto {
	private static ALG = 'AES-GCM'
	private static DELIMITER = ':::'

	public static getRandomBytes(size: number): Uint8Array {
		return window.crypto.getRandomValues(new Uint8Array(size))
	}

	public static async encrypt(plaintext: ArrayBuffer, key: CryptoKey): Promise<string> {
		const iv = this.getRandomBytes(12) // AES-GCM needs a 96bit IV
		const encrypted: ArrayBuffer = await window.crypto.subtle.encrypt(
			{ name: this.ALG, iv },
			key,
			plaintext
		)
		const data = [Hex.encode(iv), await ArrayBufferUtils.toString(encrypted)].join(this.DELIMITER)
		return data
	}

	public static async decrypt(ciphertext: string, key: CryptoKey): Promise<ArrayBuffer> {
		const splitted = ciphertext.split(this.DELIMITER)
		const iv = Hex.decode(splitted[0])
		const encrypted = await ArrayBufferUtils.fromString(splitted[1])
		const plaintext = await window.crypto.subtle.decrypt({ name: this.ALG, iv }, key, encrypted)
		return plaintext
	}
}
