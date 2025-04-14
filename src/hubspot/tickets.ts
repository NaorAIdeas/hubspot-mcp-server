import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";
import { ObjectAssociation, convertAssociationsToHubSpotFormat, associationSchema } from './associations.js';

export const hubspotTicketsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Ticket Operations
    server.tool("hubspot-get-ticket",
        "Get a specific ticket by ID from HubSpot",
        {
            ticketId: z.string(),
        },
        async ({ ticketId }) => {
            const ticket = await hubspot.crm.tickets.basicApi.getById(ticketId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(ticket),
                }],
            };
        });

    server.tool("hubspot-get-tickets",
        "Get all tickets by Id from HubSpot",
        {
            ticketIds: z.array(z.string()),
        },
        async ({ ticketIds }) => {
            const tickets = await Promise.all(ticketIds.map(async (id) => {
                const ticket = await hubspot.crm.tickets.basicApi.getById(id);
                return ticket;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(tickets),
                }],
            };
        });

    server.tool("hubspot-create-ticket",
        "Create a new ticket in HubSpot",
        {
            properties: z.record(z.string()),
            associations: associationSchema,
        },
        async ({ properties, associations }) => {
            const ticket = await hubspot.crm.tickets.basicApi.create({
                properties,
                associations: convertAssociationsToHubSpotFormat(associations)
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(ticket),
                }],
            };
        });

    server.tool("hubspot-update-ticket",
        "Update an existing ticket in HubSpot",
        {
            ticketId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ ticketId, properties }) => {
            const ticket = await hubspot.crm.tickets.basicApi.update(ticketId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(ticket),
                }],
            };
        });

    server.tool("hubspot-delete-ticket",
        "Delete a ticket from HubSpot",
        {
            ticketId: z.string(),
        },
        async ({ ticketId }) => {
            await hubspot.crm.tickets.basicApi.archive(ticketId);
            return {
                content: [{
                    type: "text",
                    text: "Ticket deleted successfully",
                }],
            };
        });

    // Ticket Search Operations
    server.tool("hubspot-search-tickets",
        "Search tickets in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.tickets.searchApi.doSearch({
                sorts: [],
                properties: properties,
                limit: limit,
                after: after,
                filterGroups: [
                    {
                        filters: [
                            {
                                propertyName: propertyName,
                                operator: operator,
                                value: searchTerm
                            }
                        ]
                    }
                ],
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(searchResponse),
                }],
            };
        });

    // Ticket Property Operations
    server.tool("hubspot-get-ticket-properties",
        "Get all ticket properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("tickets");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-ticket-property",
        "Get a specific ticket property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("tickets", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
}; 