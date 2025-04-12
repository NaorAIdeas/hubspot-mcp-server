import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotFeedbackSubmissionsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Feedback Submission
    server.tool("hubspot-get-feedback-submission",
        "Get a specific feedback submission by ID from HubSpot",
        {
            feedbackSubmissionId: z.string(),
        },
        async ({ feedbackSubmissionId }) => {
            const feedbackSubmission = await hubspot.crm.objects.feedbackSubmissions.basicApi.getById(feedbackSubmissionId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(feedbackSubmission),
                }],
            };
        });

 


    // Search Feedback Submissions
    server.tool("hubspot-search-feedback-submissions",
        "Search feedback submissions in HubSpot using various criteria",
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
            const searchResponse = await hubspot.crm.objects.feedbackSubmissions.searchApi.doSearch({
                properties: properties || ["hs_feedback_submission_status", "hs_feedback_submission_type", "hs_feedback_submission_rating", "hs_timestamp"],
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