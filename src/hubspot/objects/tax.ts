import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";
import { PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotTaxMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Get Tax
    server.tool("hubspot-get-tax",
        "Get a specific tax by ID from HubSpot",
        {
            taxId: z.string(),
        },
        async ({ taxId }) => {
            const tax = await hubspot.crm.objects.taxes.basicApi.getById(taxId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(tax),
                }],
            };
        });

    // Create Tax
    server.tool("hubspot-create-tax",
        "Create a new tax in HubSpot",
        {
            properties: z.object({
                hs_tax_name: z.string(),
                hs_tax_rate: z.string(),
                hs_tax_type: z.string().optional(),
                hs_tax_status: z.string().optional(),
            }),
            associations: z.array(z.object({
                toObjectType: z.string().describe("The type of object to associate with (e.g. 'contacts', 'companies', 'deals')"),
                toObjectId: z.string().describe("The ID of the object to associate with"),
                associationTypeId: z.number().default(1).describe("The type of association (defaults to 1 for standard association)"),
            })).optional().describe("Optional list of objects to associate this tax with"),
        },
        async ({ properties, associations }) => {
            const tax = await hubspot.crm.objects.taxes.basicApi.create({
                properties,
                associations: associations ? associations.map(assoc => ({
                    to: {
                        id: assoc.toObjectId,
                        type: assoc.toObjectType
                    },
                    types: [{
                        associationTypeId: assoc.associationTypeId,
                        associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined
                    }]
                })) : []
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(tax),
                }],
            };
        });

    server.tool("hubspot-delete-tax",
        "Delete a tax from HubSpot",
        {
            taxId: z.string(),
        },
        async ({ taxId }) => {
            await hubspot.crm.objects.taxes.basicApi.archive(taxId);
            return {
                content: [{
                    type: "text",
                    text: "Tax deleted successfully",
                }],
            };
        });

    // Search Tax
    server.tool("hubspot-search-tax",
        "Search tax in HubSpot using various criteria",
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
            const searchResponse = await hubspot.crm.objects.taxes.searchApi.doSearch({
                properties: properties || ["hs_tax_name", "hs_tax_rate", "hs_tax_type", "hs_tax_status", "hs_timestamp"],
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