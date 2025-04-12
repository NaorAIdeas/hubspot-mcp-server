import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotCustomObjectsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Custom Object Schema Operations
    server.tool("hubspot-get-custom-object-schemas",
        "Get all custom object schemas from HubSpot",
        {},
        async () => {
            const schemas = await hubspot.crm.schemas.coreApi.getAll();
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(schemas),
                }],
            };
        });

    server.tool("hubspot-get-custom-object-schema",
        "Get a specific custom object schema from HubSpot",
        {
            objectType: z.string(),
        },
        async ({ objectType }) => {
            const schema = await hubspot.crm.schemas.coreApi.getById(objectType);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(schema),
                }],
            };
        });

    // Basic Custom Object Operations
    server.tool("hubspot-get-custom-object",
        "Get a specific custom object by ID from HubSpot",
        {
            objectType: z.string(),
            objectId: z.string(),
        },
        async ({ objectType, objectId }) => {
            const object = await hubspot.crm.objects.basicApi.getById(objectType, objectId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(object),
                }],
            };
        });

    server.tool("hubspot-get-custom-objects",
        "Get all custom objects by Id from HubSpot",
        {
            objectType: z.string(),
            objectIds: z.array(z.string()),
        },
        async ({ objectType, objectIds }) => {
            const objects = await Promise.all(objectIds.map(async (id) => {
                const object = await hubspot.crm.objects.basicApi.getById(objectType, id);
                return object;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(objects),
                }],
            };
        });

    server.tool("hubspot-create-custom-object",
        "Create a new custom object in HubSpot",
        {
            objectType: z.string(),
            properties: z.record(z.string()),
        },
        async ({ objectType, properties }) => {
            const object = await hubspot.crm.objects.basicApi.create(objectType, {
                properties,
                associations: [] as PublicAssociationsForObject[]
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(object),
                }],
            };
        });

    server.tool("hubspot-update-custom-object",
        "Update an existing custom object in HubSpot",
        {
            objectType: z.string(),
            objectId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ objectType, objectId, properties }) => {
            const object = await hubspot.crm.objects.basicApi.update(objectType, objectId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(object),
                }],
            };
        });

    server.tool("hubspot-delete-custom-object",
        "Delete a custom object from HubSpot",
        {
            objectType: z.string(),
            objectId: z.string(),
        },
        async ({ objectType, objectId }) => {
            await hubspot.crm.objects.basicApi.archive(objectType, objectId);
            return {
                content: [{
                    type: "text",
                    text: "Custom object deleted successfully",
                }],
            };
        });

    // Custom Object Search Operations
    server.tool("hubspot-search-custom-objects",
        "Search custom objects in HubSpot using various criteria",
        {
            objectType: z.string(),
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ objectType, searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.objects.searchApi.doSearch(objectType, {
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

    // Custom Object Property Operations
    server.tool("hubspot-get-custom-object-properties",
        "Get all custom object properties from HubSpot",
        {
            objectType: z.string(),
        },
        async ({ objectType }) => {
            const properties = await hubspot.crm.properties.coreApi.getAll(objectType);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-custom-object-property",
        "Get a specific custom object property from HubSpot",
        {
            objectType: z.string(),
            propertyName: z.string(),
        },
        async ({ objectType, propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName(objectType, propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
}; 