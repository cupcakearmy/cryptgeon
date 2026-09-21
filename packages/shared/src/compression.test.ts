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
});
