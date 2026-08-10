import { z } from "zod";
import { basename } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchBinary } from "../client.js";
import { saveBinaryToTempFile } from "../fileStorage.js";

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
  "application/zip": "zip",
};

function defaultFileName(contentType: string): string {
  const ext = EXTENSION_BY_CONTENT_TYPE[contentType] ?? "bin";
  return `attachment.${ext}`;
}

function resolveFileName(src: string | undefined, contentType: string): string {
  if (src) {
    const name = basename(src);
    if (name && name !== "." && name !== "..") {
      return name;
    }
  }
  return defaultFileName(contentType);
}

export function registerGetAttachment(server: McpServer): void {
  server.registerTool(
    "get_attachment",
    {
      title: "添付ファイル取得",
      description:
        "法令改正IDを指定して法令本文の添付ファイル（画像・PDF・Zipなど）を取得し、一時ファイルに保存してそのパスを返す（e-Gov法令API v2 GET /attachment/{law_revision_id}）",
      inputSchema: {
        law_revision_id: z.string().describe("法令改正ID"),
        src: z.string().optional().describe("添付ファイルの指定（本文中の参照名）"),
      },
    },
    async ({ law_revision_id, src }) => {
      const { buffer, contentType } = await fetchBinary(`/attachment/${encodeURIComponent(law_revision_id)}`, {
        src,
      });
      const fileName = resolveFileName(src, contentType);
      const saved = await saveBinaryToTempFile(buffer, contentType, fileName);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(saved, null, 2),
          },
        ],
      };
    },
  );
}
