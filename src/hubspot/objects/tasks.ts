import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { ObjectAssociation, convertAssociationsToHubSpotFormat, associationSchema } from '../associations.js';

export const hubspotTasksMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Task
    server.tool("hubspot-get-tasks",
        "Get a specific task by ID from HubSpot",
        {
            taskId: z.string(),
        },
        async ({ taskId }) => {
            const task = await hubspot.crm.objects.tasks.basicApi.getById(taskId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(task),
                }],
            };
        });

    // Create Task
    server.tool("hubspot-create-tasks",
        "Create a new task in HubSpot",
        {
            properties: z.object({
                hs_task_subject: z.string(),
                hs_task_body: z.string(),
                hs_task_status: z.string().optional(),
                hs_task_priority: z.string().optional(),
                hs_task_due_date: z.string().optional(),
                hs_timestamp: z.string().optional(),
            }),
            associations: associationSchema,
        },
        async ({ properties, associations }) => {
            properties.hs_timestamp ??= new Date().toISOString();
            const task = await hubspot.crm.objects.tasks.basicApi.create({
                properties,
                associations: convertAssociationsToHubSpotFormat(associations)
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(task),
                }],
            };
        });

    server.tool("hubspot-delete-task",
        "Delete a task from HubSpot",
        {
            taskId: z.string(),
        },
        async ({ taskId }) => {
            await hubspot.crm.objects.tasks.basicApi.archive(taskId);
            return {
                content: [{
                    type: "text",
                    text: "Task deleted successfully",
                }],
            };
        });

    // Search Tasks
    server.tool("hubspot-search-tasks",
        "Search tasks in HubSpot using various criteria",
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
            const searchResponse = await hubspot.crm.objects.tasks.searchApi.doSearch({
                properties: properties || ["hs_task_subject", "hs_task_body", "hs_task_status", "hs_task_priority", "hs_task_due_date", "hs_timestamp"],
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