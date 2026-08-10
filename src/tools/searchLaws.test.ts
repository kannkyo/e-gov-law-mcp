import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as client from "../client.js";
import { registerSearchLaws } from "./searchLaws.js";

describe("registerSearchLaws", () => {
  beforeEach(() => {
    vi.spyOn(client, "fetchJson").mockResolvedValue({ laws: [{ law_id: "123" }] });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetchJson with /laws and forwards params, returning JSON text content", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerSearchLaws(server);

    // Note: the installed @modelcontextprotocol/sdk version stores the tool
    // callback under `_registeredTools[name].handler` (not `.callback` as an
    // earlier SDK version did). Verified against
    // node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js
    // (`_createRegisteredTool` builds `{ ..., handler: handler, ... }`).
    const registered = (
      server as unknown as {
        _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
      }
    )._registeredTools;
    const tool = registered["search_laws"];
    const result = await tool.handler({ law_title: "民法", law_type: ["Act", "Rule"], limit: 5 });

    expect(client.fetchJson).toHaveBeenCalledWith("/laws", {
      law_title: "民法",
      law_type: "Act,Rule",
      asof: undefined,
      limit: 5,
      offset: undefined,
    });
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ laws: [{ law_id: "123" }] });
  });
});
