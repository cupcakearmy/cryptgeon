import LZ4 from "lz4js";

// Upper bound for the decompressed payload size. A crafted note can otherwise
// make the client allocate gigabytes of memory while decompressing
// ("decompression bomb"). The server-side SIZE_LIMIT only bounds the
// compressed ciphertext, not the plaintext it expands to.
const MAX_DECOMPRESSED_SIZE = 256 * 1024 * 1024;

// The @types/lz4js declaration incorrectly types this as returning void.
const decompressBound = LZ4.decompressBound as unknown as (src: Uint8Array) => number;

export function compress(data: Uint8Array): Uint8Array {
  return LZ4.compress(data);
}

export function decompress(data: Uint8Array): Uint8Array {
  const bound = decompressBound(data);
  if (!Number.isFinite(bound) || bound > MAX_DECOMPRESSED_SIZE) {
    throw new Error("payload exceeds maximum decompressed size");
  }
  return LZ4.decompress(data);
}
