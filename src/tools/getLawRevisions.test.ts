import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as client from "../client.js";
import { registerGetLawRevisions } from "./getLawRevisions.js";

describe("registerGetLawRevisions", () => {
  beforeEach(() => {
    vi.spyOn(client, "fetchJson").mockResolvedValue({ revisions: [] });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetchJson with the encoded law id in the path and forwards filter params", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerGetLawRevisions(server);

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
    const tool = registered["get_law_revisions"];
    const result = await tool.handler({
      law_id_or_num: "民法",
      amendment_type: ["1", "3"],
      amendment_date_from: "2020-01-01",
      amendment_date_to: "2021-01-01",
    });

    expect(client.fetchJson).toHaveBeenCalledWith("/law_revisions/%E6%B0%91%E6%B3%95", {
      amendment_type: "1,3",
      amendment_date_from: "2020-01-01",
      amendment_date_to: "2021-01-01",
    });
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ revisions: [] });
  });
});
