import LZ4 from "lz4js";

export function compress(data: Uint8Array): Uint8Array {
  return LZ4.compress(data);
}

export function decompress(data: Uint8Array): Uint8Array {
  return LZ4.decompress(data);
}
