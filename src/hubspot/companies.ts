import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";

export const hubspotCompaniesMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Company Operations
    server.tool("hubspot-get-company",
        "Get a specific company by ID from HubSpot",
        {
            companyId: z.string(),
        },
        async ({ companyId }) => {
            const company = await hubspot.crm.companies.basicApi.getById(companyId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(company),
                }],
            };
        });

    server.tool("hubspot-get-companies",
        "Get all companies by Id from HubSpot",
        {
            companyIds: z.array(z.string()),
        },
        async ({ companyIds }) => {
            const companies = await Promise.all(companyIds.map(async (id) => {
                const company = await hubspot.crm.companies.basicApi.getById(id);
                return company;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(companies),
                }],
            };
        });

    server.tool("hubspot-create-company",
        "Create a new company in HubSpot",
        {
            properties: z.record(z.string()),
        },
        async ({ properties }) => {
            const company = await hubspot.crm.companies.basicApi.create({ properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(company),
                }],
            };
        });

    server.tool("hubspot-update-company",
        "Update an existing company in HubSpot",
        {
            companyId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ companyId, properties }) => {
            const company = await hubspot.crm.companies.basicApi.update(companyId, { properties });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(company),
                }],
            };
        });

    server.tool("hubspot-delete-company",
        "Delete a company from HubSpot",
        {
            companyId: z.string(),
        },
        async ({ companyId }) => {
            await hubspot.crm.companies.basicApi.archive(companyId);
            return {
                content: [{
                    type: "text",
                    text: "Company deleted successfully",
                }],
            };
        });

    // Company Search Operations
    server.tool("hubspot-search-companies",
        "Search companies in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.companies.searchApi.doSearch({
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

    // Company Property Operations
    server.tool("hubspot-get-company-properties",
        "Get all company properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("companies");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-company-property",
        "Get a specific company property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("companies", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
};
