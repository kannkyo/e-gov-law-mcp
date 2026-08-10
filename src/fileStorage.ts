import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function saveBinaryToTempFile(
  buffer: Buffer,
  contentType: string,
  suggestedFileName: string,
): Promise<{ path: string; size: number; contentType: string }> {
  const dir = await mkdtemp(join(tmpdir(), "e-gov-law-"));
  const filePath = join(dir, suggestedFileName);
  await writeFile(filePath, buffer);
  return { path: filePath, size: buffer.length, contentType };
}
