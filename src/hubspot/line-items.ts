import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { ObjectAssociation, convertAssociationsToHubSpotFormat, associationSchema } from './associations.js';

export const hubspotLineItemsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Line Item Operations
    server.tool("hubspot-get-line-item",
        "Get a specific line item by ID from HubSpot",
        {
            lineItemId: z.string(),
        },
        async ({ lineItemId }) => {
            const lineItem = await hubspot.crm.lineItems.basicApi.getById(lineItemId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(lineItem),
                }],
            };
        });

    server.tool("hubspot-get-line-items",
        "Get all line items by Id from HubSpot",
        {
            lineItemIds: z.array(z.string()),
        },
        async ({ lineItemIds }) => {
            const lineItems = await Promise.all(lineItemIds.map(async (id) => {
                const lineItem = await hubspot.crm.lineItems.basicApi.getById(id);
                return lineItem;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(lineItems),
                }],
            };
        });

    server.tool("hubspot-create-line-item",
        "Create a new line item in HubSpot",
        {
            properties: z.record(z.string()),
            associations: associationSchema,
        },
        async ({ properties, associations }) => {
            const lineItem = await hubspot.crm.lineItems.basicApi.create({
                properties,
                associations: convertAssociationsToHubSpotFormat(associations)
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(lineItem),
                }],
            };
        });

    server.tool("hubspot-update-line-item",
        "Update an existing line item in HubSpot",
        {
            lineItemId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ lineItemId, properties }) => {
            const lineItem = await hubspot.crm.lineItems.basicApi.update(lineItemId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(lineItem),
                }],
            };
        });

    server.tool("hubspot-delete-line-item",
        "Delete a line item from HubSpot",
        {
            lineItemId: z.string(),
        },
        async ({ lineItemId }) => {
            await hubspot.crm.lineItems.basicApi.archive(lineItemId);
            return {
                content: [{
                    type: "text",
                    text: "Line item deleted successfully",
                }],
            };
        });

    // Line Item Search Operations
    server.tool("hubspot-search-line-items",
        "Search line items in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.lineItems.searchApi.doSearch({
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

    // Line Item Property Operations
    server.tool("hubspot-get-line-item-properties",
        "Get all line item properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("line_items");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-line-item-property",
        "Get a specific line item property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("line_items", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
}; 