import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotEmailsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Email
    server.tool("hubspot-get-email",
        "Get a specific email by ID from HubSpot",
        {
            emailId: z.string(),
        },
        async ({ emailId }) => {
            const email = await hubspot.crm.objects.emails.basicApi.getById(emailId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(email),
                }],
            };
        });

    // Create Email
    server.tool("hubspot-create-email",
        "Create a new email in HubSpot",
        {
            properties: z.object({
                hs_email_subject: z.string(),
                hs_email_text: z.string(),
                hs_email_status: z.string().optional(),
                hs_email_direction: z.string().default("EMAIL"),
                hs_timestamp: z.string().optional(),
            }),
        },
        async ({ properties }) => {
            properties.hs_timestamp ??= new Date().toISOString();
            const email = await hubspot.crm.objects.emails.basicApi.create({
                properties,
                associations: [] as PublicAssociationsForObject[]
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(email),
                }],
            };
        });

    // Search Emails
    server.tool("hubspot-search-emails",
        "Search emails in HubSpot using various criteria",
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
            const searchResponse = await hubspot.crm.objects.emails.searchApi.doSearch({
                properties: properties || ["hs_email_subject", "hs_email_body", "hs_email_status", "hs_email_direction", "hs_timestamp"],
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

    // Update Email
    server.tool("hubspot-update-email",
        "Update an existing email in HubSpot",
        {
            emailId: z.string(),
            properties: z.object({
                hs_email_subject: z.string().optional(),
                hs_email_body: z.string().optional(),
                hs_email_status: z.string().optional(),
                hs_email_direction: z.string().optional(),
            }),
        },
        async ({ emailId, properties }) => {
            const email = await hubspot.crm.objects.emails.basicApi.update(emailId, {
                properties
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(email),
                }],
            };
        });

    server.tool("hubspot-delete-email",
        "Delete an email from HubSpot",
        {
            emailId: z.string(),
        },
        async ({ emailId }) => {
            await hubspot.crm.objects.emails.basicApi.archive(emailId);
            return {
                content: [{
                    type: "text",
                    text: "Email deleted successfully",
                }],
            };
        });
}; 