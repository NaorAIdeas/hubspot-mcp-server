import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { ObjectAssociation, convertAssociationsToHubSpotFormat, associationSchema } from '../associations.js';

export const hubspotMeetingsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Meeting
    server.tool("hubspot-get-meeting",
        "Get a specific meeting by ID from HubSpot",
        {
            meetingId: z.string(),
        },
        async ({ meetingId }) => {
            const meeting = await hubspot.crm.objects.meetings.basicApi.getById(meetingId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(meeting),
                }],
            };
        });

    // Create Meeting
    server.tool("hubspot-create-meeting",
        "Create a new meeting in HubSpot",
        {
            properties: z.object({
                hs_meeting_title: z.string(),
                hs_meeting_start_time: z.string(),
                hs_meeting_end_time: z.string(),
                hs_meeting_location: z.string().optional(),
                hs_timestamp: z.string().optional(),
                hs_communication_channel_type: z.string().optional(),
            }),
            associations: associationSchema,
        },
        async ({ properties, associations }) => {
            properties.hs_timestamp ??= new Date().toISOString();
            const meeting = await hubspot.crm.objects.meetings.basicApi.create({
                properties,
                associations: convertAssociationsToHubSpotFormat(associations)
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(meeting),
                }],
            };
        });

    // Search Meetings
    server.tool("hubspot-search-meetings",
        "Search meetings in HubSpot using various criteria",
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
            const searchResponse = await hubspot.crm.objects.meetings.searchApi.doSearch({
                properties: properties || ["hs_meeting_title", "hs_meeting_start_time", "hs_meeting_end_time", "hs_meeting_location", "hs_timestamp"],
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

    // Update Meeting
    server.tool("hubspot-update-meeting",
        "Update an existing meeting in HubSpot",
        {
            meetingId: z.string(),
            properties: z.object({
                hs_meeting_title: z.string().optional(),
                hs_meeting_start_time: z.string().optional(),
                hs_meeting_end_time: z.string().optional(),
                hs_meeting_location: z.string().optional(),
                hs_timestamp: z.string().optional(),
                hs_communication_channel_type: z.string().optional(),
            }),
        },
        async ({ meetingId, properties }) => {
            properties.hs_timestamp ??= new Date().toISOString();
            const meeting = await hubspot.crm.objects.meetings.basicApi.update(meetingId, {
                properties
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(meeting),
                }],
            };
        });

    server.tool("hubspot-delete-meeting",
        "Delete a meeting from HubSpot",
        {
            meetingId: z.string(),
        },
        async ({ meetingId }) => {
            await hubspot.crm.objects.meetings.basicApi.archive(meetingId);
            return {
                content: [{
                    type: "text",
                    text: "Meeting deleted successfully",
                }],
            };
        });
}; 