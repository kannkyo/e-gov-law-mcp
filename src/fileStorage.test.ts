import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { saveBinaryToTempFile } from "./fileStorage.js";

describe("saveBinaryToTempFile", () => {
  it("writes the buffer to a temp file and returns path, size, contentType", async () => {
    const buffer = Buffer.from("hello world");

    const result = await saveBinaryToTempFile(buffer, "text/plain", "greeting.txt");

    expect(result.size).toBe(buffer.length);
    expect(result.contentType).toBe("text/plain");
    expect(result.path.endsWith("greeting.txt")).toBe(true);

    const written = await readFile(result.path);
    expect(written.equals(buffer)).toBe(true);
  });

  it("creates a fresh temp directory per call so filenames never collide", async () => {
    const bufferA = Buffer.from("a");
    const bufferB = Buffer.from("b");

    const resultA = await saveBinaryToTempFile(bufferA, "text/plain", "same.txt");
    const resultB = await saveBinaryToTempFile(bufferB, "text/plain", "same.txt");

    expect(resultA.path).not.toBe(resultB.path);
  });
});
