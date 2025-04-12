import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/companies/index.js";

// Common object types in HubSpot
const HUBSPOT_OBJECT_TYPES = [
    'contacts', 'companies', 'deals', 'tickets', 'quotes', 'products', 'line_items',
    'calls', 'communications', 'emails', 'meetings', 'notes', 'tasks', 'postal_mail',
    'feedback_submissions', 'taxes', 'goals', 'appointments', 'courses', 'listings',
    'services', 'leads', 'invoices', 'orders', 'carts', 'subscriptions', 'payments'
] as const;

// Association Type IDs for all possible HubSpot relationships
export enum HubSpotAssociationTypes {
    // Company associations
    COMPANY_TO_COMPANY = 450,
    CHILD_TO_PARENT_COMPANY = 14,
    PARENT_TO_CHILD_COMPANY = 13,
    COMPANY_TO_CONTACT = 280,
    COMPANY_TO_CONTACT_PRIMARY = 2,
    COMPANY_TO_DEAL = 342,
    COMPANY_TO_DEAL_PRIMARY = 6,
    COMPANY_TO_TICKET = 340,
    COMPANY_TO_TICKET_PRIMARY = 25,
    COMPANY_TO_CALL = 181,
    COMPANY_TO_EMAIL = 185,
    COMPANY_TO_MEETING = 187,
    COMPANY_TO_NOTE = 189,
    COMPANY_TO_TASK = 191,
    COMPANY_TO_COMMUNICATION = 88,
    COMPANY_TO_POSTAL_MAIL = 460,
    COMPANY_TO_INVOICE = 180,
    COMPANY_TO_ORDER = 510,
    COMPANY_TO_PAYMENT = 390,
    COMPANY_TO_SUBSCRIPTION = 298,
    COMPANY_TO_APPOINTMENT = 909,
    COMPANY_TO_COURSE = 939,
    COMPANY_TO_LISTING = 885,
    COMPANY_TO_SERVICE = 793,

    // Contact associations
    CONTACT_TO_CONTACT = 449,
    CONTACT_TO_COMPANY = 279,
    CONTACT_TO_COMPANY_PRIMARY = 1,
    CONTACT_TO_DEAL = 4,
    CONTACT_TO_TICKET = 15,
    CONTACT_TO_CALL = 193,
    CONTACT_TO_EMAIL = 197,
    CONTACT_TO_MEETING = 199,
    CONTACT_TO_NOTE = 201,
    CONTACT_TO_TASK = 203,
    CONTACT_TO_COMMUNICATION = 82,
    CONTACT_TO_POSTAL_MAIL = 454,
    CONTACT_TO_CART = 587,
    CONTACT_TO_ORDER = 508,
    CONTACT_TO_INVOICE = 178,
    CONTACT_TO_PAYMENT = 388,
    CONTACT_TO_SUBSCRIPTION = 296,
    CONTACT_TO_APPOINTMENT = 907,
    CONTACT_TO_COURSE = 861,
    CONTACT_TO_LISTING = 883,
    CONTACT_TO_SERVICE = 799,

    // Deal associations
    DEAL_TO_DEAL = 451,
    DEAL_TO_CONTACT = 3,
    DEAL_TO_COMPANY = 341,
    DEAL_TO_COMPANY_PRIMARY = 5,
    DEAL_TO_TICKET = 27,
    DEAL_TO_CALL = 205,
    DEAL_TO_EMAIL = 209,
    DEAL_TO_MEETING = 211,
    DEAL_TO_NOTE = 213,
    DEAL_TO_TASK = 215,
    DEAL_TO_COMMUNICATION = 86,
    DEAL_TO_POSTAL_MAIL = 458,
    DEAL_TO_DEAL_SPLIT = 313,
    DEAL_TO_LINE_ITEM = 19,
    DEAL_TO_INVOICE = 176,
    DEAL_TO_ORDER = 511,
    DEAL_TO_PAYMENT = 392,
    DEAL_TO_QUOTE = 63,
    DEAL_TO_SUBSCRIPTION = 300,
    DEAL_TO_APPOINTMENT = 945,
    DEAL_TO_COURSE = 863,
    DEAL_TO_LISTING = 887,
    DEAL_TO_SERVICE = 795,

    // Ticket associations
    TICKET_TO_TICKET = 452,
    TICKET_TO_CONTACT = 16,
    TICKET_TO_COMPANY = 339,
    TICKET_TO_COMPANY_PRIMARY = 26,
    TICKET_TO_DEAL = 28,
    TICKET_TO_CALL = 219,
    TICKET_TO_EMAIL = 223,
    TICKET_TO_MEETING = 225,
    TICKET_TO_NOTE = 227,
    TICKET_TO_TASK = 229,
    TICKET_TO_COMMUNICATION = 84,
    TICKET_TO_POSTAL_MAIL = 456,
    TICKET_TO_THREAD = 32,
    TICKET_TO_CONVERSATION = 278,
    TICKET_TO_ORDER = 526,
    TICKET_TO_APPOINTMENT = 947,
    TICKET_TO_COURSE = 941,
    TICKET_TO_LISTING = 943,
    TICKET_TO_SERVICE = 797,

    // Lead associations
    LEAD_TO_PRIMARY_CONTACT = 578,
    LEAD_TO_CONTACT = 608,
    LEAD_TO_COMPANY = 610,
    LEAD_TO_CALL = 596,
    LEAD_TO_EMAIL = 598,
    LEAD_TO_MEETING = 600,
    LEAD_TO_NOTE = 854,
    LEAD_TO_TASK = 646,
    LEAD_TO_COMMUNICATION = 602,

    // Appointment associations
    APPOINTMENT_TO_CONTACT = 966,
    APPOINTMENT_TO_COMPANY = 908,
    APPOINTMENT_TO_DEAL = 944,
    APPOINTMENT_TO_TICKET = 946,
    APPOINTMENT_TO_CALL = 912,
    APPOINTMENT_TO_EMAIL = 916,
    APPOINTMENT_TO_MEETING = 918,
    APPOINTMENT_TO_NOTE = 920,
    APPOINTMENT_TO_TASK = 922,
    APPOINTMENT_TO_COMMUNICATION = 924,
    APPOINTMENT_TO_POSTAL_MAIL = 926,

    // Course associations
    COURSE_TO_CONTACT = 860,
    COURSE_TO_COMPANY = 938,
    COURSE_TO_DEAL = 862,
    COURSE_TO_TICKET = 940,
    COURSE_TO_CALL = 866,
    COURSE_TO_EMAIL = 870,
    COURSE_TO_MEETING = 872,
    COURSE_TO_NOTE = 874,
    COURSE_TO_TASK = 876,
    COURSE_TO_COMMUNICATION = 878,
    COURSE_TO_POSTAL_MAIL = 880,

    // Listing associations
    LISTING_TO_CONTACT = 882,
    LISTING_TO_COMPANY = 884,
    LISTING_TO_DEAL = 886,
    LISTING_TO_TICKET = 942,
    LISTING_TO_CALL = 890,
    LISTING_TO_EMAIL = 894,
    LISTING_TO_MEETING = 896,
    LISTING_TO_NOTE = 898,
    LISTING_TO_TASK = 900,
    LISTING_TO_COMMUNICATION = 902,
    LISTING_TO_POSTAL_MAIL = 904,

    // Service associations
    SERVICE_TO_CONTACT = 798,
    SERVICE_TO_COMPANY = 792,
    SERVICE_TO_DEAL = 794,
    SERVICE_TO_TICKET = 796,
    SERVICE_TO_CALL = 840,
    SERVICE_TO_EMAIL = 842,
    SERVICE_TO_MEETING = 838,
    SERVICE_TO_NOTE = 836,
    SERVICE_TO_TASK = 852,
    SERVICE_TO_COMMUNICATION = 846,
    SERVICE_TO_POSTAL_MAIL = 848,

    // Call associations
    CALL_TO_CONTACT = 194,
    CALL_TO_COMPANY = 182,
    CALL_TO_DEAL = 206,
    CALL_TO_TICKET = 220,
    CALL_TO_APPOINTMENT = 913,
    CALL_TO_COURSE = 867,
    CALL_TO_LISTING = 891,
    CALL_TO_SERVICE = 841,

    // Email associations
    EMAIL_TO_CONTACT = 198,
    EMAIL_TO_COMPANY = 186,
    EMAIL_TO_DEAL = 210,
    EMAIL_TO_TICKET = 224,
    EMAIL_TO_APPOINTMENT = 917,
    EMAIL_TO_COURSE = 871,
    EMAIL_TO_LISTING = 895,
    EMAIL_TO_SERVICE = 843,

    // Meeting associations
    MEETING_TO_CONTACT = 200,
    MEETING_TO_COMPANY = 188,
    MEETING_TO_DEAL = 212,
    MEETING_TO_TICKET = 226,
    MEETING_TO_APPOINTMENT = 919,
    MEETING_TO_COURSE = 873,
    MEETING_TO_LISTING = 897,
    MEETING_TO_SERVICE = 839,

    // Note associations
    NOTE_TO_CONTACT = 202,
    NOTE_TO_COMPANY = 190,
    NOTE_TO_DEAL = 214,
    NOTE_TO_TICKET = 228,
    NOTE_TO_APPOINTMENT = 921,
    NOTE_TO_COURSE = 875,
    NOTE_TO_LISTING = 899,
    NOTE_TO_SERVICE = 837,

    // Postal mail associations
    POSTAL_MAIL_TO_CONTACT = 453,
    POSTAL_MAIL_TO_COMPANY = 459,
    POSTAL_MAIL_TO_DEAL = 457,
    POSTAL_MAIL_TO_TICKET = 455,
    POSTAL_MAIL_TO_APPOINTMENT = 927,
    POSTAL_MAIL_TO_COURSE = 881,
    POSTAL_MAIL_TO_LISTING = 905,
    POSTAL_MAIL_TO_SERVICE = 849,

    // Task associations
    TASK_TO_CONTACT = 204,
    TASK_TO_COMPANY = 192,
    TASK_TO_DEAL = 216,
    TASK_TO_TICKET = 230,
    TASK_TO_APPOINTMENT = 923,
    TASK_TO_COURSE = 877,
    TASK_TO_LISTING = 901,
    TASK_TO_SERVICE = 853,

    // Communication associations
    COMMUNICATION_TO_CONTACT = 81,
    COMMUNICATION_TO_COMPANY = 87,
    COMMUNICATION_TO_DEAL = 85,
    COMMUNICATION_TO_TICKET = 83,
    COMMUNICATION_TO_APPOINTMENT = 925,
    COMMUNICATION_TO_COURSE = 879,
    COMMUNICATION_TO_LISTING = 903,
    COMMUNICATION_TO_SERVICE = 847,

    // Invoice associations
    INVOICE_TO_CONTACT = 177,
    INVOICE_TO_COMPANY = 179,
    INVOICE_TO_DEAL = 175,
    INVOICE_TO_QUOTE = 407,
    INVOICE_TO_SUBSCRIPTION = 622,
    INVOICE_TO_PAYMENT_LINK = 815,
    INVOICE_TO_ORDER = 517,
    INVOICE_TO_TICKET = 986,
    INVOICE_TO_LINE_ITEM = 409,
    INVOICE_TO_DISCOUNT = 411,
    INVOICE_TO_FEE = 413,
    INVOICE_TO_TAX = 415,
    INVOICE_TO_COMMERCE_PAYMENT = 541,
    INVOICE_TO_PAYMENT_SCHEDULE_INSTALLMENT = 691,
    INVOICE_TO_DATA_SYNC_STATE = 679,

    // Quote associations
    QUOTE_TO_CONTACT = 69,
    QUOTE_TO_COMPANY = 71,
    QUOTE_TO_DEAL = 64,
    QUOTE_TO_LINE_ITEM = 67,
    QUOTE_TO_QUOTE_TEMPLATE = 286,
    QUOTE_TO_DISCOUNT = 362,
    QUOTE_TO_FEE = 364,
    QUOTE_TO_TAX = 366,
    QUOTE_TO_CONTACT_SIGNER = 702,
    QUOTE_TO_CART = 733,
    QUOTE_TO_INVOICE = 408,
    QUOTE_TO_ORDER = 731,
    QUOTE_TO_PAYMENT = 398,
    QUOTE_TO_SUBSCRIPTION = 304,

    // Line item associations
    LINE_ITEM_TO_ABANDONED_CART = 571,
    LINE_ITEM_TO_CART = 591,
    LINE_ITEM_TO_COMMERCE_PAYMENT = 396,
    LINE_ITEM_TO_DEAL = 20,
    LINE_ITEM_TO_DISCOUNT = 368,
    LINE_ITEM_TO_INVOICE = 410,
    LINE_ITEM_TO_ORDER = 514,
    LINE_ITEM_TO_PAYMENT_LINK = 759,
    LINE_ITEM_TO_QUOTE = 68,
    LINE_ITEM_TO_SUBSCRIPTION = 302,
    LINE_ITEM_TO_UPCOMING_SUBSCRIPTION = 565,

    // Order associations
    ORDER_TO_CART = 593,
    ORDER_TO_CONTACT = 507,
    ORDER_TO_COMPANY = 509,
    ORDER_TO_DEAL = 512,
    ORDER_TO_DISCOUNT = 519,
    ORDER_TO_DISCOUNT_CODE = 521,
    ORDER_TO_INVOICE = 518,
    ORDER_TO_LINE_ITEM = 513,
    ORDER_TO_PAYMENT = 523,
    ORDER_TO_QUOTE = 730,
    ORDER_TO_SUBSCRIPTION = 516,
    ORDER_TO_TASK = 726,
    ORDER_TO_TICKET = 525,

    // Cart associations
    CART_TO_CONTACT = 586,
    CART_TO_DISCOUNT = 588,
    CART_TO_LINE_ITEM = 590,
    CART_TO_ORDER = 592,
    CART_TO_QUOTE = 732,
    CART_TO_TASK = 728,
    CART_TO_TICKET = 594
}

// Mapping of object type pairs to their corresponding association types
const ASSOCIATION_TYPE_MAP: Record<string, Record<string, HubSpotAssociationTypes>> = {
    companies: {
        contacts: HubSpotAssociationTypes.COMPANY_TO_CONTACT_PRIMARY,
        deals: HubSpotAssociationTypes.COMPANY_TO_DEAL_PRIMARY,
        tickets: HubSpotAssociationTypes.COMPANY_TO_TICKET_PRIMARY,
        calls: HubSpotAssociationTypes.COMPANY_TO_CALL,
        emails: HubSpotAssociationTypes.COMPANY_TO_EMAIL,
        meetings: HubSpotAssociationTypes.COMPANY_TO_MEETING,
        notes: HubSpotAssociationTypes.COMPANY_TO_NOTE,
        tasks: HubSpotAssociationTypes.COMPANY_TO_TASK,
        communications: HubSpotAssociationTypes.COMPANY_TO_COMMUNICATION,
        postal_mail: HubSpotAssociationTypes.COMPANY_TO_POSTAL_MAIL,
        invoices: HubSpotAssociationTypes.COMPANY_TO_INVOICE,
        orders: HubSpotAssociationTypes.COMPANY_TO_ORDER,
        payments: HubSpotAssociationTypes.COMPANY_TO_PAYMENT,
        subscriptions: HubSpotAssociationTypes.COMPANY_TO_SUBSCRIPTION,
        appointments: HubSpotAssociationTypes.COMPANY_TO_APPOINTMENT,
        courses: HubSpotAssociationTypes.COMPANY_TO_COURSE,
        listings: HubSpotAssociationTypes.COMPANY_TO_LISTING,
        services: HubSpotAssociationTypes.COMPANY_TO_SERVICE,
        companies: HubSpotAssociationTypes.COMPANY_TO_COMPANY
    },
    contacts: {
        companies: HubSpotAssociationTypes.CONTACT_TO_COMPANY_PRIMARY,
        deals: HubSpotAssociationTypes.CONTACT_TO_DEAL,
        tickets: HubSpotAssociationTypes.CONTACT_TO_TICKET,
        calls: HubSpotAssociationTypes.CONTACT_TO_CALL,
        emails: HubSpotAssociationTypes.CONTACT_TO_EMAIL,
        meetings: HubSpotAssociationTypes.CONTACT_TO_MEETING,
        notes: HubSpotAssociationTypes.CONTACT_TO_NOTE,
        tasks: HubSpotAssociationTypes.CONTACT_TO_TASK,
        communications: HubSpotAssociationTypes.CONTACT_TO_COMMUNICATION,
        postal_mail: HubSpotAssociationTypes.CONTACT_TO_POSTAL_MAIL,
        carts: HubSpotAssociationTypes.CONTACT_TO_CART,
        orders: HubSpotAssociationTypes.CONTACT_TO_ORDER,
        invoices: HubSpotAssociationTypes.CONTACT_TO_INVOICE,
        payments: HubSpotAssociationTypes.CONTACT_TO_PAYMENT,
        subscriptions: HubSpotAssociationTypes.CONTACT_TO_SUBSCRIPTION,
        appointments: HubSpotAssociationTypes.CONTACT_TO_APPOINTMENT,
        courses: HubSpotAssociationTypes.CONTACT_TO_COURSE,
        listings: HubSpotAssociationTypes.CONTACT_TO_LISTING,
        services: HubSpotAssociationTypes.CONTACT_TO_SERVICE,
        contacts: HubSpotAssociationTypes.CONTACT_TO_CONTACT
    },
    deals: {
        contacts: HubSpotAssociationTypes.DEAL_TO_CONTACT,
        companies: HubSpotAssociationTypes.DEAL_TO_COMPANY_PRIMARY,
        tickets: HubSpotAssociationTypes.DEAL_TO_TICKET,
        calls: HubSpotAssociationTypes.DEAL_TO_CALL,
        emails: HubSpotAssociationTypes.DEAL_TO_EMAIL,
        meetings: HubSpotAssociationTypes.DEAL_TO_MEETING,
        notes: HubSpotAssociationTypes.DEAL_TO_NOTE,
        tasks: HubSpotAssociationTypes.DEAL_TO_TASK,
        communications: HubSpotAssociationTypes.DEAL_TO_COMMUNICATION,
        postal_mail: HubSpotAssociationTypes.DEAL_TO_POSTAL_MAIL,
        line_items: HubSpotAssociationTypes.DEAL_TO_LINE_ITEM,
        invoices: HubSpotAssociationTypes.DEAL_TO_INVOICE,
        orders: HubSpotAssociationTypes.DEAL_TO_ORDER,
        payments: HubSpotAssociationTypes.DEAL_TO_PAYMENT,
        quotes: HubSpotAssociationTypes.DEAL_TO_QUOTE,
        subscriptions: HubSpotAssociationTypes.DEAL_TO_SUBSCRIPTION,
        appointments: HubSpotAssociationTypes.DEAL_TO_APPOINTMENT,
        courses: HubSpotAssociationTypes.DEAL_TO_COURSE,
        listings: HubSpotAssociationTypes.DEAL_TO_LISTING,
        services: HubSpotAssociationTypes.DEAL_TO_SERVICE,
        deals: HubSpotAssociationTypes.DEAL_TO_DEAL
    },
    tickets: {
        contacts: HubSpotAssociationTypes.TICKET_TO_CONTACT,
        companies: HubSpotAssociationTypes.TICKET_TO_COMPANY_PRIMARY,
        deals: HubSpotAssociationTypes.TICKET_TO_DEAL,
        calls: HubSpotAssociationTypes.TICKET_TO_CALL,
        emails: HubSpotAssociationTypes.TICKET_TO_EMAIL,
        meetings: HubSpotAssociationTypes.TICKET_TO_MEETING,
        notes: HubSpotAssociationTypes.TICKET_TO_NOTE,
        tasks: HubSpotAssociationTypes.TICKET_TO_TASK,
        communications: HubSpotAssociationTypes.TICKET_TO_COMMUNICATION,
        postal_mail: HubSpotAssociationTypes.TICKET_TO_POSTAL_MAIL,
        orders: HubSpotAssociationTypes.TICKET_TO_ORDER,
        appointments: HubSpotAssociationTypes.TICKET_TO_APPOINTMENT,
        courses: HubSpotAssociationTypes.TICKET_TO_COURSE,
        listings: HubSpotAssociationTypes.TICKET_TO_LISTING,
        services: HubSpotAssociationTypes.TICKET_TO_SERVICE,
        tickets: HubSpotAssociationTypes.TICKET_TO_TICKET
    }
    // Add more mappings as needed for other object types
};

// Helper function to determine the correct association type ID
function getAssociationTypeId(fromObjectType: string, toObjectType: string): HubSpotAssociationTypes {
    // Check if we have a direct mapping for this pair
    if (ASSOCIATION_TYPE_MAP[fromObjectType]?.[toObjectType]) {
        return ASSOCIATION_TYPE_MAP[fromObjectType][toObjectType];
    }

    // If no direct mapping found, try to construct the enum key as a fallback
    const fromType = fromObjectType.toUpperCase();
    const toType = toObjectType.toUpperCase();
    const enumKey = `${fromType}_TO_${toType}` as keyof typeof HubSpotAssociationTypes;
    
    if (enumKey in HubSpotAssociationTypes) {
        return HubSpotAssociationTypes[enumKey];
    }

    throw new Error(`No valid association type found for ${fromObjectType} to ${toObjectType}`);
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