import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";

export const hubspotDealsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Deal Operations
    server.tool("hubspot-get-deal",
        "Get a specific deal by ID from HubSpot",
        {
            dealId: z.string(),
        },
        async ({ dealId }) => {
            const deal = await hubspot.crm.deals.basicApi.getById(dealId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(deal),
                }],
            };
        });

    server.tool("hubspot-get-deals",
        "Get all deals by Id from HubSpot",
        {
            dealIds: z.array(z.string()),
        },
        async ({ dealIds }) => {
            const deals = await Promise.all(dealIds.map(async (id) => {
                const deal = await hubspot.crm.deals.basicApi.getById(id);
                return deal;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(deals),
                }],
            };
        });

    server.tool("hubspot-create-deal",
        "Create a new deal in HubSpot",
        {
            properties: z.record(z.string()),
        },
        async ({ properties }) => {
            const deal = await hubspot.crm.deals.basicApi.create({
                properties,
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(deal),
                }],
            };
        });

    server.tool("hubspot-update-deal",
        "Update an existing deal in HubSpot",
        {
            dealId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ dealId, properties }) => {
            const deal = await hubspot.crm.deals.basicApi.update(dealId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(deal),
                }],
            };
        });

    server.tool("hubspot-delete-deal",
        "Delete a deal from HubSpot",
        {
            dealId: z.string(),
        },
        async ({ dealId }) => {
            await hubspot.crm.deals.basicApi.archive(dealId);
            return {
                content: [{
                    type: "text",
                    text: "Deal deleted successfully",
                }],
            };
        });

    // Deal Search Operations
    server.tool("hubspot-search-deals",
        "Search deals in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.deals.searchApi.doSearch({
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

    // Deal Property Operations
    server.tool("hubspot-get-deal-properties",
        "Get all deal properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("deals");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-deal-property",
        "Get a specific deal property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("deals", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
};
