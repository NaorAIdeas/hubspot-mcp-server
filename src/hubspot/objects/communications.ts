import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotCommunicationsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Communication
    server.tool("hubspot-get-communication",
        "Get a specific communication by ID from HubSpot",
        {
            communicationId: z.string(),
        },
        async ({ communicationId }) => {
            const communication = await hubspot.crm.objects.communications.basicApi.getById(communicationId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(communication),
                }],
            };
        });

    // Create Communication
    server.tool("hubspot-create-communication",
        "Create a new communication in HubSpot",
        {
            properties: z.object({
                hs_communication_type: z.string(),
                hs_communication_body: z.string(),
                hs_communication_status: z.string().optional(),
            }),
        },
        async ({ properties }) => {
            const communication = await hubspot.crm.objects.communications.basicApi.create({
                properties,
                associations: [] as PublicAssociationsForObject[]
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(communication),
                }],
            };
        });

    // Search Communications
    server.tool("hubspot-search-communications",
        "Search communications in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
            sortBy: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties, sortBy }) => {
            const searchResponse = await hubspot.crm.objects.communications.searchApi.doSearch({
                properties: properties || ["hs_communication_type", "hs_communication_body", "hs_communication_status", "hs_communication_channel_type", "hs_timestamp"],
                limit: limit,
                after: after,
                sorts: sortBy,
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

    // Update Communication
    server.tool("hubspot-update-communication",
        "Update an existing communication in HubSpot",
        {
            communicationId: z.string(),
            properties: z.object({
                hs_communication_type: z.string().optional(),
                hs_communication_body: z.string().optional(),
                hs_communication_status: z.string().optional(),
            }),
        },
        async ({ communicationId, properties }) => {
            const communication = await hubspot.crm.objects.communications.basicApi.update(communicationId, {
                properties
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(communication),
                }],
            };
        });

    server.tool("hubspot-delete-communication",
        "Delete a communication from HubSpot",
        {
            communicationId: z.string(),
        },
        async ({ communicationId }) => {
            await hubspot.crm.objects.communications.basicApi.archive(communicationId);
            return {
                content: [{
                    type: "text",
                    text: "Communication deleted successfully",
                }],
            };
        });
}; 