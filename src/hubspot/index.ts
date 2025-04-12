import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { hubspotContactsMCP } from './contacts.js';
import { hubspotCompaniesMCP } from './companies.js';
import { hubspotDealsMCP } from './deals.js';
import { hubspotTicketsMCP } from './tickets.js';
import { hubspotLineItemsMCP } from './line-items.js';
import { hubspotProductsMCP } from './products.js';
import { hubspotCustomObjectsMCP } from './custom-objects.js';
import { hubspotQuotesMCP } from './quotes.js';
import { hubspotTimelineEventsMCP } from './timeline-events.js';
import { hubspotObjectsMCP } from "./objects/index.js";
import { hubspotAssociationsMCP } from './associations.js';

export const hubspotMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Initialize all MCP modules
    hubspotContactsMCP(server, hubspot);
    hubspotCompaniesMCP(server, hubspot);
    hubspotDealsMCP(server, hubspot);
    hubspotTicketsMCP(server, hubspot);
    hubspotLineItemsMCP(server, hubspot);
    hubspotProductsMCP(server, hubspot);
    hubspotCustomObjectsMCP(server, hubspot);
    hubspotQuotesMCP(server, hubspot);
    hubspotTimelineEventsMCP(server, hubspot);
    hubspotObjectsMCP(server, hubspot);
    hubspotAssociationsMCP(server, hubspot);
}; 