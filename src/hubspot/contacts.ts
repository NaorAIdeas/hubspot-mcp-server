import { ListResourcesCallback, McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

export const hubspotContactsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Contact Operations
    server.tool("hubspot-get-contact",
        "Get a specific contact by ID from HubSpot",
        {
            contactId: z.string(),
        },
        async ({ contactId }) => {
            const contact = await hubspot.crm.contacts.basicApi.getById(contactId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(contact),
                }],
            };
        });

    server.tool("hubspot-get-contacts",
        "Get all contacts by Id from HubSpot",
        {
            contactIds: z.array(z.string()),
        },
        async ({ contactIds }) => {
            const contacts = await Promise.all(contactIds.map(async (id) => {
                const contact = await hubspot.crm.contacts.basicApi.getById(id);
                return contact;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(contacts),
                }],
            };
        });

    server.tool("hubspot-create-contact",
        "Create a new contact in HubSpot",
        {
            properties: z.record(z.string()),
        },
        async ({ properties }) => {
            const contact = await hubspot.crm.contacts.basicApi.create({ properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(contact),
                }],
            };
        });

    server.tool("hubspot-update-contact",
        "Update an existing contact in HubSpot",
        {
            contactId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ contactId, properties }) => {
            const contact = await hubspot.crm.contacts.basicApi.update(contactId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(contact),
                }],
            };
        });

    server.tool("hubspot-delete-contact",
        "Delete a contact from HubSpot",
        {
            contactId: z.string(),
        },
        async ({ contactId }) => {
            await hubspot.crm.contacts.basicApi.archive(contactId);
            return {
                content: [{
                    type: "text",
                    text: "Contact deleted successfully",
                }],
            };
        });

    // Contact Search Operations
    server.tool("hubspot-search-contacts",
        "Search contacts in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            //properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after }) => {
            const searchResponse = await hubspot.crm.contacts.searchApi.doSearch({
                sorts: [],
                //properties: properties,
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
                content: searchResponse.results.map(result => ({
                    type: "text",
                    text: JSON.stringify(result),
                    uri: "hubspot://get-contact/" + result.id
                }))
            };
        });



    // Contact Property Operations
    server.tool("hubspot-get-contact-properties",
        "Get all contact properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("contacts");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-contact-property",
        "Get a specific contact property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("contacts", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
}; 