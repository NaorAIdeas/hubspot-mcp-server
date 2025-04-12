import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotGoalsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Goal
    server.tool("hubspot-get-goal",
        "Get a specific goal by ID from HubSpot",
        {
            goalId: z.string(),
        },
        async ({ goalId }) => {
            const goal = await hubspot.crm.objects.goals.basicApi.getById(goalId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(goal),
                }],
            };
        });
    // Search Goals
    server.tool("hubspot-search-goals",
        "Search goals in HubSpot using various criteria",
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
            const searchResponse = await hubspot.crm.objects.goals.searchApi.doSearch({
                properties: properties || ["hs_goal_name", "hs_goal_status", "hs_goal_type", "hs_goal_target", "hs_timestamp"],
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