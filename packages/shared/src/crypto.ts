import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { managedNonce, randomBytes } from "@noble/ciphers/utils.js";
import { scrypt } from "@noble/hashes/scrypt.js";

export {
  bytesToUtf8,
  utf8ToBytes,
  hexToBytes,
  bytesToHex,
  randomBytes,
} from "@noble/ciphers/utils.js";

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
