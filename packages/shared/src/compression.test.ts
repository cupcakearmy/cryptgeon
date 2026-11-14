import { describe, expect, it } from "vitest";
import { compress, decompress, utf8ToBytes } from "./index";

describe("compression", () => {
  it("round-trips small text", () => {
    const data = utf8ToBytes("hello world");
    const compressed = compress(data);
    const decompressed = decompress(compressed);
    expect(decompressed).toEqual(data);
  });

  it("round-trips highly compressible data", () => {
    const data = utf8ToBytes("a".repeat(10_000));
    const compressed = compress(data);
    expect(compressed.length).toBeLessThan(data.length);
    const decompressed = decompress(compressed);
    expect(decompressed).toEqual(data);
  });

  it("round-trips arbitrary bytes", () => {
    const data = new Uint8Array([0, 128, 255, 1, 2, 3, 200, 100]);
    const compressed = compress(data);
    const decompressed = decompress(compressed);
    expect(decompressed).toEqual(data);
  });

  it("rejects frames declaring a huge content size", () => {
    // LZ4 frame: magic + descriptor (version 1 + content-size flag) +
    // block-size byte + content size (8 bytes LE, 512 MiB) + header checksum.
    const frame = new Uint8Array([
      0x04, 0x22, 0x4d, 0x18, 0x48, 0x70,
      0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00,
      0x00,
    ]);
    expect(() => decompress(frame)).toThrow("maximum decompressed size");
  });

  it("accepts data below the limit", () => {
    const data = new Uint8Array(64).fill(0);
    expect(decompress(compress(data))).toEqual(data);
  });

  it("rejects malformed input", () => {
    expect(() => decompress(new Uint8Array([1, 2, 3]))).toThrow();
  });
});
