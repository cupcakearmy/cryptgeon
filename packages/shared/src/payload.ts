import { encode, decode } from "@msgpack/msgpack";
import { compress, decompress } from "./compression.js";
import {
  deriveKey,
  encrypt,
  decrypt,
  generateKey,
  randomBytes,
} from "./crypto.js";
import type { FileDTO, NoteContent } from "./types.js";

export type NoteInput =
  | { type: "text"; text: string }
  | { type: "files"; files: FileDTO[] };

export type PackResult = {
  data: Uint8Array;
  extra: Uint8Array;
  key: Uint8Array;
};

export function packContent(input: NoteInput, password?: string): PackResult {
  let key: Uint8Array;
  let extra: Uint8Array;
  if (password) {
    const salt = randomBytes(16);
    key = deriveKey(password, salt);
    extra = encode({ salt, N: 32768, r: 8, p: 1 });
  } else {
    key = generateKey();
    extra = new Uint8Array();
  }

  const content: NoteContent =
    input.type === "text"
      ? { type: "text", data: input.text }
      : { type: "files", data: input.files };

  const encoded = encrypt(compress(encode(content)), key);
  return { data: encoded, extra, key };
}

export function unpackContent(data: Uint8Array, key: Uint8Array): NoteContent {
  const content = decode(decompress(decrypt(data, key))) as NoteContent;
  if (content.type !== "text" && content.type !== "files") {
    throw new Error("Unknown content type");
  }
  return content;
}