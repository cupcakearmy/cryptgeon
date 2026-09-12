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
  | { type: "files"; files: (File | FileDTO)[] };

export type PackResult = {
  data: Uint8Array;
  extra: Uint8Array;
  key: Uint8Array;
};

export async function packContent(
  input: NoteInput,
  password?: string,
): Promise<PackResult> {
  let key: Uint8Array;
  let extra = new Uint8Array();
  if (password) {
    const salt = randomBytes(16);
    key = deriveKey(password, salt);
    extra = encode({ salt, N: 32768, r: 8, p: 1 });
  } else {
    key = generateKey();
  }

  let content: NoteContent;
  if (input.type === "text") {
    content = { type: "text", data: input.text };
  } else {
    content = {
      type: "files",
      data: await Promise.all(
        input.files.map(async (file) => {
          const name = file instanceof File ? file.name : file.name;
          const mime = file instanceof File ? file.type : file.mime;
          const data = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : file.data;
          return { name, mime, size: data.length, data };
        }),
      ),
    };
  }

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