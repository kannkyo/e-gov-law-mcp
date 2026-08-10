#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSearchLaws } from "./tools/searchLaws.js";
import { registerGetLawRevisions } from "./tools/getLawRevisions.js";
import { registerGetLawData } from "./tools/getLawData.js";
import { registerGetAttachment } from "./tools/getAttachment.js";
import { registerSearchKeyword } from "./tools/searchKeyword.js";
import { registerDownloadLawFile } from "./tools/downloadLawFile.js";

const server = new McpServer({
  name: "e-gov-law",
  version: "0.1.0",
});

registerSearchLaws(server);
registerGetLawRevisions(server);
registerGetLawData(server);
registerGetAttachment(server);
registerSearchKeyword(server);
registerDownloadLawFile(server);

const transport = new StdioServerTransport();
await server.connect(transport);
