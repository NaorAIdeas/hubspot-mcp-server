import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { ObjectAssociation, convertAssociationsToHubSpotFormat, associationSchema } from '../associations.js';

export const hubspotPostalMailMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Postal Mail
    server.tool("hubspot-get-postal-mail",
        "Get a specific postal mail by ID from HubSpot",
        {
            postalMailId: z.string(),
        },
        async ({ postalMailId }) => {
            const postalMail = await hubspot.crm.objects.postalMail.basicApi.getById(postalMailId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(postalMail),
                }],
            };
        });

    // Create Postal Mail
    server.tool("hubspot-create-postal-mail",
        "Create a new postal mail in HubSpot",
        {
            properties: z.object({
                hs_postal_mail_subject: z.string(),
                hs_postal_mail_body: z.string(),
                hs_postal_mail_status: z.string().optional(),
                hs_timestamp: z.string().optional(),
            }),
            associations: associationSchema,
        },
        async ({ properties, associations }) => {
            properties.hs_timestamp ??= new Date().toISOString();
            const postalMail = await hubspot.crm.objects.postalMail.basicApi.create({
                properties,
                associations: convertAssociationsToHubSpotFormat(associations)
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(postalMail),
                }],
            };
        });

    // Search Postal Mail
    server.tool("hubspot-search-postal-mail",
        "Search postal mail in HubSpot using various criteria",
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
            const searchResponse = await hubspot.crm.objects.postalMail.searchApi.doSearch({
                properties: properties || ["hs_postal_mail_subject", "hs_postal_mail_body", "hs_postal_mail_status", "hs_postal_mail_sent_date", "hs_timestamp"],
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

    server.tool("hubspot-delete-postal-mail",
        "Delete a postal mail from HubSpot",
        {
            postalMailId: z.string(),
        },
        async ({ postalMailId }) => {
            await hubspot.crm.objects.postalMail.basicApi.archive(postalMailId);
            return {
                content: [{
                    type: "text",
                    text: "Postal mail deleted successfully",
                }],
            };
        });
}; 