import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../client.js";

export function registerGetLawRevisions(server: McpServer): void {
  server.registerTool(
    "get_law_revisions",
    {
      title: "法令改正履歴取得",
      description: "指定した法令の改正履歴一覧を取得する（e-Gov法令API v2 GET /law_revisions/{law_id_or_num}）",
      inputSchema: {
        law_id_or_num: z.string().describe("法令ID または 法令番号"),
        amendment_type: z
          .array(z.enum(["1", "3", "8"]))
          .optional()
          .describe("改正種別（1:新規, 3:被改正, 8:廃止。複数指定可）"),
        amendment_date_from: z.string().optional().describe("施行期日の範囲開始（YYYY-MM-DD）"),
        amendment_date_to: z.string().optional().describe("施行期日の範囲終了（YYYY-MM-DD）"),
      },
    },
    async ({ law_id_or_num, amendment_type, amendment_date_from, amendment_date_to }) => {
      const data = await fetchJson(`/law_revisions/${encodeURIComponent(law_id_or_num)}`, {
        amendment_type: amendment_type?.join(","),
        amendment_date_from,
        amendment_date_to,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
