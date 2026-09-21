import { describe, expect, it } from "vitest";
import { deriveKey, encrypt, decrypt, generateKey, utf8ToBytes, randomBytes } from "./crypto";

describe("crypto", () => {
  it("encrypts and decrypts with generated key", () => {
    const data = utf8ToBytes("hello world");
    const key = generateKey();
    const enc = encrypt(data, key);
    const dec = decrypt(enc, key);
    expect(dec).toEqual(data);
  });

  it("encrypts and decrypts with derived key", () => {
    const data = utf8ToBytes("secret message");
    const salt = randomBytes(16);
    const key = deriveKey("password123", salt);
    const enc = encrypt(data, key);
    const dec = decrypt(enc, key);
    expect(dec).toEqual(data);
  });

  it("derived key has same length as generated", () => {
    const salt = randomBytes(16);
    expect(deriveKey("test", salt).length).toBe(generateKey().length);
  });
});