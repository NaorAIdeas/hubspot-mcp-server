import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";

export const hubspotProductsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Product Operations
    server.tool("hubspot-get-product",
        "Get a specific product by ID from HubSpot",
        {
            productId: z.string(),
        },
        async ({ productId }) => {
            const product = await hubspot.crm.products.basicApi.getById(productId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(product),
                }],
            };
        });

    server.tool("hubspot-get-products",
        "Get all products by Id from HubSpot",
        {
            productIds: z.array(z.string()),
        },
        async ({ productIds }) => {
            const products = await Promise.all(productIds.map(async (id) => {
                const product = await hubspot.crm.products.basicApi.getById(id);
                return product;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(products),
                }],
            };
        });

    server.tool("hubspot-create-product",
        "Create a new product in HubSpot",
        {
            properties: z.record(z.string()),
        },
        async ({ properties }) => {
            const product = await hubspot.crm.products.basicApi.create({
                properties,
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(product),
                }],
            };
        });

    server.tool("hubspot-update-product",
        "Update an existing product in HubSpot",
        {
            productId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ productId, properties }) => {
            const product = await hubspot.crm.products.basicApi.update(productId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(product),
                }],
            };
        });

    server.tool("hubspot-delete-product",
        "Delete a product from HubSpot",
        {
            productId: z.string(),
        },
        async ({ productId }) => {
            await hubspot.crm.products.basicApi.archive(productId);
            return {
                content: [{
                    type: "text",
                    text: "Product deleted successfully",
                }],
            };
        });

    // Product Search Operations
    server.tool("hubspot-search-products",
        "Search products in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.products.searchApi.doSearch({
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

    // Product Property Operations
    server.tool("hubspot-get-product-properties",
        "Get all product properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("products");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-product-property",
        "Get a specific product property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("products", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
}; 