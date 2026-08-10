import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../client.js";

export function registerGetLawData(server: McpServer): void {
  server.registerTool(
    "get_law_data",
    {
      title: "法令本文取得",
      description: "法令ID・法令番号・改正IDを指定して法令本文をJSONで取得する（e-Gov法令API v2 GET /law_data/{law_id_or_num_or_revision_id}）",
      inputSchema: {
        law_id_or_num_or_revision_id: z.string().describe("法令ID、法令番号、または改正ID"),
        elm: z.string().optional().describe("取得したい要素の指定（例: 条番号）"),
        law_full_text_format: z.literal("json").optional().describe("本文の形式（jsonのみサポート）"),
      },
    },
    async ({ law_id_or_num_or_revision_id, elm, law_full_text_format }) => {
      const data = await fetchJson(`/law_data/${encodeURIComponent(law_id_or_num_or_revision_id)}`, {
        elm,
        law_full_text_format,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
