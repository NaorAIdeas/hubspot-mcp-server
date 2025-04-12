import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotCallsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Call
    server.tool("hubspot-get-call",
        "Get a specific call by ID from HubSpot",
        {
            callId: z.string(),
        },
        async ({ callId }) => {
            const call = await hubspot.crm.objects.calls.basicApi.getById(callId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(call),
                }],
            };
        });

    // Create Call
    server.tool("hubspot-create-call",
        "Create a new call in HubSpot",
        {
            properties: z.object({
                hs_call_title: z.string(),
                hs_call_body: z.string(),
                hs_call_duration: z.string().optional(),
                hs_call_direction: z.string().optional(),
                hs_call_status: z.string().optional(),
                hs_timestamp: z.string().optional(),
            }),
        },
        async ({ properties }) => {
            properties.hs_timestamp ??= new Date().toISOString();
            const call = await hubspot.crm.objects.calls.basicApi.create({
                properties,
                associations: [] as PublicAssociationsForObject[]
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(call),
                }],
            };
        });

    server.tool("hubspot-delete-call",
        "Delete a call from HubSpot",
        {
            callId: z.string(),
        },
        async ({ callId }) => {
            await hubspot.crm.objects.calls.basicApi.archive(callId);
            return {
                content: [{
                    type: "text",
                    text: "Call deleted successfully",
                }],
            };
        });

    // Search Calls
    server.tool("hubspot-search-calls",
        "Search calls in HubSpot using various criteria",
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
            const searchResponse = await hubspot.crm.objects.calls.searchApi.doSearch({
                properties: properties || ["hs_call_title", "hs_call_body", "hs_call_duration", "hs_call_direction", "hs_call_status", "hs_timestamp"],
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
}; 