import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";
import { AssociationSpecAssociationCategoryEnum, PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotQuotesMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Quote Operations
    server.tool("hubspot-get-quote",
        "Get a specific quote by ID from HubSpot",
        {
            quoteId: z.string(),
        },
        async ({ quoteId }) => {
            const quote = await hubspot.crm.quotes.basicApi.getById(quoteId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(quote),
                }],
            };
        });

    server.tool("hubspot-get-quotes",
        "Get all quotes by Id from HubSpot",
        {
            quoteIds: z.array(z.string()),
        },
        async ({ quoteIds }) => {
            const quotes = await Promise.all(quoteIds.map(async (id) => {
                const quote = await hubspot.crm.quotes.basicApi.getById(id);
                return quote;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(quotes),
                }],
            };
        });

    server.tool("hubspot-create-quote",
        "Create a new quote in HubSpot",
        {
            properties: z.record(z.string()),
        },
        async ({ properties }) => {
            const quote = await hubspot.crm.quotes.basicApi.create({
                properties,
                associations: [] as PublicAssociationsForObject[]
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(quote),
                }],
            };
        });

    server.tool("hubspot-update-quote",
        "Update an existing quote in HubSpot",
        {
            quoteId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ quoteId, properties }) => {
            const quote = await hubspot.crm.quotes.basicApi.update(quoteId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(quote),
                }],
            };
        });

    server.tool("hubspot-delete-quote",
        "Delete a quote from HubSpot",
        {
            quoteId: z.string(),
        },
        async ({ quoteId }) => {
            await hubspot.crm.quotes.basicApi.archive(quoteId);
            return {
                content: [{
                    type: "text",
                    text: "Quote deleted successfully",
                }],
            };
        });

    // Quote Search Operations
    server.tool("hubspot-search-quotes",
        "Search quotes in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.quotes.searchApi.doSearch({
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

    // Quote Association Operations
    server.tool("hubspot-get-quote-contact-associations",
        "Get associations between quotes and contacts",
        {
            quoteId: z.string(),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
        },
        async ({ quoteId, limit, after }) => {
            const associations = await hubspot.crm.associations.v4.basicApi.getPage(
                "quotes",
                quoteId,
                "contacts",
                after,
                limit
            );
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(associations),
                }],
            };
        });

    server.tool("hubspot-get-quote-company-associations",
        "Get associations between quotes and companies",
        {
            quoteId: z.string(),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
        },
        async ({ quoteId, limit, after }) => {
            const associations = await hubspot.crm.associations.v4.basicApi.getPage(
                "quotes",
                quoteId,
                "companies",
                after,
                limit
            );
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(associations),
                }],
            };
        });

    server.tool("hubspot-get-quote-deal-associations",
        "Get associations between quotes and deals",
        {
            quoteId: z.string(),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
        },
        async ({ quoteId, limit, after }) => {
            const associations = await hubspot.crm.associations.v4.basicApi.getPage(
                "quotes",
                quoteId,
                "deals",
                after,
                limit
            );
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(associations),
                }],
            };
        });

    server.tool("hubspot-get-quote-line-item-associations",
        "Get associations between quotes and line items",
        {
            quoteId: z.string(),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
        },
        async ({ quoteId, limit, after }) => {
            const associations = await hubspot.crm.associations.v4.basicApi.getPage(
                "quotes",
                quoteId,
                "line_items",
                after,
                limit
            );
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(associations),
                }],
            };
        });

    server.tool("hubspot-create-quote-association",
        "Create an association between a quote and another object",
        {
            quoteId: z.string(),
            toObjectType: z.string(),
            toObjectId: z.string(),
            associationTypeId: z.number().default(1),
        },
        async ({ quoteId, toObjectType, toObjectId, associationTypeId }) => {
            const association = await hubspot.crm.associations.v4.basicApi.create(
                "quotes",
                quoteId,
                toObjectType,
                toObjectId,
                associationTypeId ? [{
                    associationTypeId,
                    associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined
                }] : []
            );
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(association),
                }],
            };
        });

    // Quote Property Operations
    server.tool("hubspot-get-quote-properties",
        "Get all quote properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("quotes");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-quote-property",
        "Get a specific quote property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("quotes", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
}; 