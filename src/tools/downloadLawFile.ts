import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchBinary } from "../client.js";
import { saveBinaryToTempFile } from "../fileStorage.js";

const FILE_TYPES = ["xml", "json", "html", "rtf", "docx"] as const;

export function registerDownloadLawFile(server: McpServer): void {
  server.registerTool(
    "download_law_file",
    {
      title: "法令本文ファイルダウンロード",
      description:
        "法令ID・法令番号・改正IDを指定して法令本文をファイル形式（xml/json/html/rtf/docx）でダウンロードし、一時ファイルに保存してそのパスを返す（e-Gov法令API v2 GET /law_file/{file_type}/{law_id_or_num_or_revision_id}）",
      inputSchema: {
        file_type: z.enum(FILE_TYPES).describe("ダウンロード形式"),
        law_id_or_num_or_revision_id: z.string().describe("法令ID、法令番号、または改正ID"),
        asof: z.string().optional().describe("法令の時点（YYYY-MM-DD）"),
      },
    },
    async ({ file_type, law_id_or_num_or_revision_id, asof }) => {
      const { buffer, contentType } = await fetchBinary(
        `/law_file/${file_type}/${encodeURIComponent(law_id_or_num_or_revision_id)}`,
        { asof },
      );
      const saved = await saveBinaryToTempFile(buffer, contentType, `law_data.${file_type}`);
      return {
        content: [{ type: "text", text: JSON.stringify(saved, null, 2) }],
      };
    },
  );
}
