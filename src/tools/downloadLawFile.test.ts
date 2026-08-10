import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as client from "../client.js";
import * as fileStorage from "../fileStorage.js";
import { registerDownloadLawFile } from "./downloadLawFile.js";

describe("registerDownloadLawFile", () => {
  beforeEach(() => {
    vi.spyOn(client, "fetchBinary").mockResolvedValue({
      buffer: Buffer.from("<law/>"),
      contentType: "application/xml",
    });
    vi.spyOn(fileStorage, "saveBinaryToTempFile").mockResolvedValue({
      path: "/tmp/e-gov-law-xyz/law.xml",
      size: 6,
      contentType: "application/xml",
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds the path from file_type and id, fetches binary, and saves with matching extension", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerDownloadLawFile(server);

    // Note: the installed @modelcontextprotocol/sdk version stores the tool
    // callback under `_registeredTools[name].handler` (not `.callback` as an
    // earlier SDK version did). See getAttachment.test.ts for the same note.
    const registered = (
      server as unknown as {
        _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
      }
    )._registeredTools;
    const tool = registered["download_law_file"];
    const result = await tool.handler({
      file_type: "xml",
      law_id_or_num_or_revision_id: "民法",
      asof: "2020-01-01",
    });

    expect(client.fetchBinary).toHaveBeenCalledWith("/law_file/xml/%E6%B0%91%E6%B3%95", {
      asof: "2020-01-01",
    });
    expect(fileStorage.saveBinaryToTempFile).toHaveBeenCalledWith(
      Buffer.from("<law/>"),
      "application/xml",
      "law_data.xml",
    );
    expect(result.content[0].text).toContain("/tmp/e-gov-law-xyz/law.xml");
  });
});
