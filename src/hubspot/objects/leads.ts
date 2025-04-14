import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { ObjectAssociation, convertAssociationsToHubSpotFormat, associationSchema } from '../associations.js';

export const hubspotLeadsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Lead Operations
    server.tool("hubspot-create-lead",
        "Create a new lead in HubSpot",
        {
            properties: z.object({
                hs_lead_status: z.string(),
                hs_lead_source: z.string().optional(),
                hs_lead_owner: z.string().optional(),
            }),
            associations: associationSchema,
        },
        async ({ properties, associations }) => {
            const lead = await hubspot.crm.objects.leads.basicApi.create({
                properties,
                associations: convertAssociationsToHubSpotFormat(associations)
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(lead),
                }],
            };
        });

    server.tool("hubspot-update-lead",
        "Update an existing lead in HubSpot",
        {
            leadId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ leadId, properties }) => {
            const lead = await hubspot.crm.objects.leads.basicApi.update(leadId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(lead),
                }],
            };
        });

    server.tool("hubspot-delete-lead",
        "Delete a lead from HubSpot",
        {
            leadId: z.string(),
        },
        async ({ leadId }) => {
            await hubspot.crm.objects.leads.basicApi.archive(leadId);
            return {
                content: [{
                    type: "text",
                    text: "Lead deleted successfully",
                }],
            };
        });

    // Lead Search Operations
    server.tool("hubspot-search-leads",
        "Search leads in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.objects.leads.searchApi.doSearch({
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

    // Lead Property Operations
    server.tool("hubspot-get-lead-properties",
        "Get all lead properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("leads");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });
}; 