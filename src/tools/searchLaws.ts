import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../client.js";

export function registerSearchLaws(server: McpServer): void {
  server.registerTool(
    "search_laws",
    {
      title: "法令一覧検索",
      description: "法令名・法令種別・時点(asof)を指定して法令一覧を検索する（e-Gov法令API v2 GET /laws）",
      inputSchema: {
        law_title: z.string().optional().describe("法令名（部分一致）"),
        law_type: z
          .array(z.enum(["Constitution", "Act", "CabinetOrder", "ImperialOrder", "MinisterialOrdinance", "Rule", "Misc"]))
          .optional()
          .describe("法令種別（複数指定可）"),
        asof: z.string().optional().describe("法令の時点（YYYY-MM-DD）"),
        limit: z.number().int().positive().optional().describe("取得件数の上限"),
        offset: z.number().int().nonnegative().optional().describe("取得開始位置"),
      },
    },
    async ({ law_title, law_type, asof, limit, offset }) => {
      const data = await fetchJson("/laws", { law_title, law_type: law_type?.join(","), asof, limit, offset });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
