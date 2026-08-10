import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as client from "../client.js";
import { registerGetLawData } from "./getLawData.js";

describe("registerGetLawData", () => {
  beforeEach(() => {
    vi.spyOn(client, "fetchJson").mockResolvedValue({ law_full_text: "第一条 ..." });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetchJson with the encoded id in the path and forwards elm/law_full_text_format", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerGetLawData(server);

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
    const tool = registered["get_law_data"];
    const result = await tool.handler({
      law_id_or_num_or_revision_id: "民法",
      elm: "第一条",
      law_full_text_format: "json",
    });

    expect(client.fetchJson).toHaveBeenCalledWith("/law_data/%E6%B0%91%E6%B3%95", {
      elm: "第一条",
      law_full_text_format: "json",
    });
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ law_full_text: "第一条 ..." });
  });
});
