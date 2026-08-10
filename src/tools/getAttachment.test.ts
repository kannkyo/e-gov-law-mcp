import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as client from "../client.js";
import * as fileStorage from "../fileStorage.js";
import { registerGetAttachment } from "./getAttachment.js";

describe("registerGetAttachment", () => {
  beforeEach(() => {
    vi.spyOn(client, "fetchBinary").mockResolvedValue({
      buffer: Buffer.from("PDF-DATA"),
      contentType: "application/pdf",
    });
    vi.spyOn(fileStorage, "saveBinaryToTempFile").mockResolvedValue({
      path: "/tmp/e-gov-law-abc123/attachment.pdf",
      size: 8,
      contentType: "application/pdf",
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches the binary, saves it to a temp file, and returns path/size/contentType as text", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerGetAttachment(server);

    // Note: the installed @modelcontextprotocol/sdk version stores the tool
    // callback under `_registeredTools[name].handler` (not `.callback` as an
    // earlier SDK version did). See getLawData.test.ts for the same note.
    const registered = (
      server as unknown as {
        _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
      }
    )._registeredTools;
    const tool = registered["get_attachment"];
    const result = await tool.handler({ law_revision_id: "rev-1", src: "attachment.pdf" });

    expect(client.fetchBinary).toHaveBeenCalledWith("/attachment/rev-1", { src: "attachment.pdf" });
    expect(fileStorage.saveBinaryToTempFile).toHaveBeenCalledWith(
      Buffer.from("PDF-DATA"),
      "application/pdf",
      "attachment.pdf",
    );
    expect(result.content[0].text).toContain("/tmp/e-gov-law-abc123/attachment.pdf");
    expect(result.content[0].text).toContain("application/pdf");
    expect(result.content[0].text).toContain("8");
  });

  it("falls back to a generic filename derived from content-type when src is not given", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerGetAttachment(server);

    const registered = (
      server as unknown as {
        _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
      }
    )._registeredTools;
    const tool = registered["get_attachment"];
    await tool.handler({ law_revision_id: "rev-1" });

    expect(fileStorage.saveBinaryToTempFile).toHaveBeenCalledWith(
      Buffer.from("PDF-DATA"),
      "application/pdf",
      "attachment.pdf",
    );
  });

  it("sanitizes a slash-separated src down to its final path segment, never passing the raw path through", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerGetAttachment(server);

    const registered = (
      server as unknown as {
        _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
      }
    )._registeredTools;
    const tool = registered["get_attachment"];
    await tool.handler({ law_revision_id: "rev-1", src: "../../etc/passwd" });

    // path.basename() reduces forward-slash-separated paths on both POSIX and
    // Windows, so the caller-supplied traversal prefix is stripped and only
    // the safe final segment survives -- the raw, unsanitized path must never
    // reach saveBinaryToTempFile's join(dir, suggestedFileName).
    expect(fileStorage.saveBinaryToTempFile).toHaveBeenCalledWith(Buffer.from("PDF-DATA"), "application/pdf", "passwd");
  });

  // path.basename() only treats backslashes as path separators on Windows;
  // on POSIX, `\` is a literal filename character, so these assertions only
  // hold on win32 and are gated accordingly.
  (process.platform === "win32" ? describe : describe.skip)("on Windows (backslash paths)", () => {
    it("sanitizes a backslash-separated src down to its final path segment, never passing the raw path through", async () => {
      const server = new McpServer({ name: "test", version: "0.0.0" });
      registerGetAttachment(server);

      const registered = (
        server as unknown as {
          _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
        }
      )._registeredTools;
      const tool = registered["get_attachment"];
      await tool.handler({ law_revision_id: "rev-1", src: "..\\..\\Users\\victim\\file.txt" });

      expect(fileStorage.saveBinaryToTempFile).toHaveBeenCalledWith(Buffer.from("PDF-DATA"), "application/pdf", "file.txt");
    });

    it("falls back to a generic filename when src is a backslash-only traversal with no filename segment", async () => {
      const server = new McpServer({ name: "test", version: "0.0.0" });
      registerGetAttachment(server);

      const registered = (
        server as unknown as {
          _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
        }
      )._registeredTools;
      const tool = registered["get_attachment"];
      await tool.handler({ law_revision_id: "rev-1", src: "..\\.." });

      expect(fileStorage.saveBinaryToTempFile).toHaveBeenCalledWith(
        Buffer.from("PDF-DATA"),
        "application/pdf",
        "attachment.pdf",
      );
    });
  });

  it("falls back to a generic filename when src is exactly '..'", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerGetAttachment(server);

    const registered = (
      server as unknown as {
        _registeredTools: Record<string, { handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }> }>;
      }
    )._registeredTools;
    const tool = registered["get_attachment"];
    await tool.handler({ law_revision_id: "rev-1", src: ".." });

    expect(fileStorage.saveBinaryToTempFile).toHaveBeenCalledWith(
      Buffer.from("PDF-DATA"),
      "application/pdf",
      "attachment.pdf",
    );
  });
});
