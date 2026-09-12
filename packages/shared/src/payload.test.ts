import { describe, expect, it } from "vitest";
import { packContent, unpackContent } from "./payload";
import { bytesToUtf8, utf8ToBytes } from "./crypto";

describe("payload", () => {
  it("round-trips a text note through the full pipeline", () => {
    const { data, extra, key } = packContent({ type: "text", text: "hello world" });
    expect(extra.length).toBe(0);
    const content = unpackContent(data, key);
    expect(content).toEqual({ type: "text", data: "hello world" });
  });

  it("round-trips with a password and sets extra", () => {
    const { data, extra, key } = packContent({ type: "text", text: "secret" }, "pw123");
    expect(extra.length).toBeGreaterThan(0);
    const content = unpackContent(data, key);
    expect(content).toEqual({ type: "text", data: "secret" });
  });

  it("round-trips files (FileDTO)", () => {
    const file = { name: "a.txt", mime: "text/plain", size: 5, data: utf8ToBytes("hello") };
    const { data, key } = packContent({ type: "files", files: [file] });
    const content = unpackContent(data, key);
    expect(content.type).toBe("files");
    if (content.type === "files") {
      expect(content.data).toHaveLength(1);
      expect(content.data[0]!.name).toBe("a.txt");
      expect(bytesToUtf8(content.data[0]!.data)).toBe("hello");
    }
  });
});