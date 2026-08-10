import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../client.js";

export function registerSearchKeyword(server: McpServer): void {
  server.registerTool(
    "search_keyword",
    {
      title: "法令キーワード検索",
      description: "法令本文内に指定したキーワードを含む法令を検索する（e-Gov法令API v2 GET /keyword）",
      inputSchema: {
        keyword: z.string().describe("検索キーワード（必須）"),
        law_type: z
          .array(z.enum(["Constitution", "Act", "CabinetOrder", "ImperialOrder", "MinisterialOrdinance", "Rule", "Misc"]))
          .optional()
          .describe("法令種別（複数指定可）"),
        limit: z.number().int().positive().optional().describe("取得件数の上限"),
        offset: z.number().int().nonnegative().optional().describe("取得開始位置"),
      },
    },
    async ({ keyword, law_type, limit, offset }) => {
      const data = await fetchJson("/keyword", { keyword, law_type: law_type?.join(","), limit, offset });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
