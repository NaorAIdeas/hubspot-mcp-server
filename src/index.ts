import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dotenv from 'dotenv'
import hubspot from '@hubspot/api-client'
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { hubspotMCP } from "./hubspot/index.js";

dotenv.config()

const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_API_KEY })

const server = new McpServer({
    name: "hubspot",
    version: "1.0.0"
});

hubspotMCP(server, hubspotClient)

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Hubspot MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
