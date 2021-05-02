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

const ALG = 'AES-GCM'

export function getRandomBytes(size = 16): Uint8Array {
	return window.crypto.getRandomValues(new Uint8Array(size))
}

export function getKeyFromString(password: string) {
	return window.crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey']
	)
}

export async function getDerivedForKey(key: CryptoKey, salt: ArrayBuffer) {
	const iterations = 1_000
	return window.crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations,
			hash: 'SHA-512',
		},
		key,
		{ name: ALG, length: 256 },
		true,
		['encrypt', 'decrypt']
	)
}

export async function encrypt(plaintext: string, key: CryptoKey) {
	const salt = getRandomBytes(16)
	const derived = await getDerivedForKey(key, salt)
	const iv = getRandomBytes(16)
	const encrypted = await window.crypto.subtle.encrypt(
		{ name: ALG, iv },
		derived,
		new TextEncoder().encode(plaintext)
	)
	return [salt, iv, encrypted].map(Hex.encode).join(':')
}

export async function decrypt(ciphertext: string, key: CryptoKey) {
	const [salt, iv, encrypted] = ciphertext.split(':').map(Hex.decode)
	const derived = await getDerivedForKey(key, salt)
	const plaintext = await window.crypto.subtle.decrypt({ name: ALG, iv }, derived, encrypted)
	return new TextDecoder().decode(plaintext)
}
