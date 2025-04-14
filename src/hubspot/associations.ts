import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot, { AssociationTypes } from '@hubspot/api-client';
import { z } from "zod";
import { AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";

// Common object types in HubSpot
const HUBSPOT_OBJECT_TYPES = [
    'contacts', 'companies', 'deals', 'tickets', 'quotes', 'products', 'line_items',
    'calls', 'communications', 'emails', 'meetings', 'notes', 'tasks', 'postal_mail',
    'feedback_submissions', 'taxes', 'goals', 'appointments', 'courses', 'listings',
    'services', 'leads', 'invoices', 'orders', 'carts', 'subscriptions', 'payments'
] as const;

// Mapping of object type pairs to their corresponding association types
const ASSOCIATION_TYPE_MAP: Record<string, Record<string, number>> = {
    companies: {
        contacts: AssociationTypes.companyToContact,
        deals: AssociationTypes.companyToDeal,
        tickets: AssociationTypes.companyToTicket,
        calls: AssociationTypes.companyToCall,
        emails: AssociationTypes.companyToEmail,
        meetings: AssociationTypes.companyToMeeting,
        notes: AssociationTypes.companyToNote,
        tasks: AssociationTypes.companyToTask,
        communications: AssociationTypes.companyToCommunication,
        postal_mail: AssociationTypes.companyToPostalMail,
        companies: AssociationTypes.companyToCompany
    },
    contacts: {
        companies: AssociationTypes.contactToCompany,
        deals: AssociationTypes.contactToDeal,
        tickets: AssociationTypes.contactToTicket,
        calls: AssociationTypes.contactToCall,
        emails: AssociationTypes.contactToEmail,
        meetings: AssociationTypes.contactToMeeting,
        notes: AssociationTypes.contactToNote,
        tasks: AssociationTypes.contactToTask,
        communications: AssociationTypes.contactToCommunication,
        postal_mail: AssociationTypes.contactToPostalMail,
        contacts: AssociationTypes.contactToContact,
        feedback_submissions: AssociationTypes.contactToFeedbackSubmission
    },
    deals: {
        contacts: AssociationTypes.dealToContact,
        companies: AssociationTypes.dealToCompany,
        tickets: AssociationTypes.dealToTicket,
        calls: AssociationTypes.dealToCall,
        emails: AssociationTypes.dealToEmail,
        meetings: AssociationTypes.dealToMeeting,
        notes: AssociationTypes.dealToNote,
        tasks: AssociationTypes.dealToTask,
        communications: AssociationTypes.dealToCommunication,
        postal_mail: AssociationTypes.dealToPostalMail,
        line_items: AssociationTypes.dealToLineItem,
        quotes: AssociationTypes.dealToQuote,
        deals: AssociationTypes.dealToDeal
    },
    tickets: {
        contacts: AssociationTypes.ticketToContact,
        companies: AssociationTypes.ticketToCompany,
        deals: AssociationTypes.ticketToDeal,
        calls: AssociationTypes.ticketToCall,
        emails: AssociationTypes.ticketToEmail,
        meetings: AssociationTypes.ticketToMeeting,
        notes: AssociationTypes.ticketToNote,
        tasks: AssociationTypes.ticketToTask,
        communications: AssociationTypes.ticketToCommunication,
        postal_mail: AssociationTypes.ticketToPostalMail,
        tickets: AssociationTypes.ticketToTicket,
        feedback_submissions: AssociationTypes.ticketToFeedbackSubmission
    },
    feedback_submissions: {
        contacts: AssociationTypes.feedbackSubmissionToContact,
        tickets: AssociationTypes.feedbackSubmissionToTicket
    }
};

// Helper function to determine the correct association type ID
export function getAssociationTypeId(fromObjectType: string, toObjectType: string): number {
    // Check if we have a direct mapping for this pair
    if (ASSOCIATION_TYPE_MAP[fromObjectType]?.[toObjectType]) {
        return ASSOCIATION_TYPE_MAP[fromObjectType][toObjectType];
    }

    // Log error but return a default value to avoid breaking the application
    console.error(`No valid association type found for ${fromObjectType} to ${toObjectType}. Using default association.`);
    return 1;
}

export const hubspotAssociationsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Create Association
    server.tool("hubspot-create-association",
        "Create a new association between two objects in HubSpot",
        {
            fromObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the source object (e.g. 'contacts', 'companies', 'deals')"),
            fromObjectId: z.string().describe("The ID of the source object"),
            toObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the target object (e.g. 'contacts', 'companies', 'deals')"),
            toObjectId: z.string().describe("The ID of the target object"),
            associationCategory: z.nativeEnum(AssociationSpecAssociationCategoryEnum)
                .describe("The category of the association (HUBSPOT_DEFINED or USER_DEFINED)"),
        },
        async ({ fromObjectType, fromObjectId, toObjectType, toObjectId, associationCategory }) => {
            const associationTypeId = getAssociationTypeId(fromObjectType, toObjectType);

            const association = await hubspot.crm.associations.v4.basicApi.create(
                fromObjectType,
                fromObjectId,
                toObjectType,
                toObjectId,
                [{
                    associationCategory,
                    associationTypeId
                }]
            );
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(association),
                }],
            };
        });

    // Get Associations
    server.tool("hubspot-get-associations",
        "Get all associations for a specific object in HubSpot",
        {
            fromObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the source object"),
            fromObjectId: z.string().describe("The ID of the source object"),
            toObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the target object"),
            limit: z.number().optional().default(100).describe("Maximum number of results to return (default: 100)"),
            after: z.string().optional().describe("The paging cursor token of the last successfully read resource will be returned as the paging.next.after JSON property of a paged response containing more results"),
        },
        async ({ fromObjectType, fromObjectId, toObjectType, limit, after }) => {
            const associations = await hubspot.crm.associations.v4.basicApi.getPage(
                fromObjectType,
                fromObjectId,
                toObjectType,
                after,
                limit
            );
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(associations),
                }],
            };
        });

    // Delete Association
    server.tool("hubspot-delete-association",
        "Delete an association between two objects in HubSpot",
        {
            fromObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the source object"),
            fromObjectId: z.string().describe("The ID of the source object"),
            toObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the target object"),
            toObjectId: z.string().describe("The ID of the target object"),
        },
        async ({ fromObjectType, fromObjectId, toObjectType, toObjectId }) => {
            await hubspot.crm.associations.v4.basicApi.archive(
                fromObjectType,
                fromObjectId,
                toObjectType,
                toObjectId
            );
            return {
                content: [{
                    type: "text",
                    text: "Association deleted successfully",
                }],
            };
        });

    // Batch Create Associations
    server.tool("hubspot-batch-create-associations",
        "Create multiple associations in a single request",
        {
            inputs: z.array(z.object({
                fromObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the source object"),
                fromObjectId: z.string().describe("The ID of the source object"),
                toObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the target object"),
                toObjectId: z.string().describe("The ID of the target object"),
                associationCategory: z.nativeEnum(AssociationSpecAssociationCategoryEnum)
                    .describe("The category of the association (HUBSPOT_DEFINED or USER_DEFINED)"),
            })).describe("Array of association inputs to create"),
        },
        async ({ inputs }) => {
            const batchInput = inputs.map(input => ({
                _from: {
                    id: input.fromObjectId
                },
                to: {
                    id: input.toObjectId
                },
                types: [{
                    associationCategory: input.associationCategory,
                    associationTypeId: getAssociationTypeId(input.fromObjectType, input.toObjectType)
                }]
            }));

            const result = await hubspot.crm.associations.v4.batchApi.create(
                "batch",
                "create",
                {
                    inputs: batchInput
                }
            );
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result),
                }],
            };
        });

    // Batch Delete Associations
    server.tool("hubspot-batch-delete-associations",
        "Delete multiple associations in a single request",
        {
            inputs: z.array(z.object({
                fromObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the source object"),
                fromObjectId: z.string().describe("The ID of the source object"),
                toObjectType: z.enum(HUBSPOT_OBJECT_TYPES).describe("The type of the target object"),
                toObjectId: z.string().describe("The ID of the target object"),
            })).describe("Array of association inputs to delete"),
        },
        async ({ inputs }) => {
            const batchInput = inputs.map(input => ({
                _from: {
                    id: input.fromObjectId
                },
                to: [{
                    id: input.toObjectId
                }]
            }));

            await hubspot.crm.associations.v4.batchApi.archive(
                "batch",
                "archive",
                {
                    inputs: batchInput
                }
            );
            return {
                content: [{
                    type: "text",
                    text: "Associations deleted successfully",
                }],
            };
        });
}; 