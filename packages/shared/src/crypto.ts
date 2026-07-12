import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { managedNonce, randomBytes, utf8ToBytes } from "@noble/ciphers/utils.js";
import { scrypt } from "@noble/hashes/scrypt.js";

export { bytesToUtf8, utf8ToBytes } from "@noble/ciphers/utils.js";
export { randomBytes } from "@noble/ciphers/utils.js";

const N = 2 ** 15;
const KEY_SIZE = 32;

export function generateKey(): Uint8Array {
  return randomBytes(KEY_SIZE);
}

export function deriveKey(password: string, salt: Uint8Array): Uint8Array {
  return scrypt(password, salt, { N, r: 8, p: 1, dkLen: KEY_SIZE });
}

export function encrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
  const chacha = managedNonce(xchacha20poly1305)(key);
  return chacha.encrypt(data);
}

export function decrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
  const chacha = managedNonce(xchacha20poly1305)(key);
  return chacha.decrypt(data);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
