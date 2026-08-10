import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as client from "../client.js";
import { registerSearchKeyword } from "./searchKeyword.js";

describe("registerSearchKeyword", () => {
  beforeEach(() => {
    vi.spyOn(client, "fetchJson").mockResolvedValue({ items: [] });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetchJson with /keyword and the required keyword param", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerSearchKeyword(server);

    const registered = (
      server as unknown as {
        _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
      }
    )._registeredTools;
    const tool = registered["search_keyword"];
    await tool.handler({ keyword: "個人情報", law_type: ["Act", "Rule"], limit: 20 });

    expect(client.fetchJson).toHaveBeenCalledWith("/keyword", {
      keyword: "個人情報",
      law_type: "Act,Rule",
      limit: 20,
      offset: undefined,
    });
  });
});
