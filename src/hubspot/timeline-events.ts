import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum, PublicAssociationsForObject } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotTimelineEventsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Timeline Event Operations
    server.tool("hubspot-get-timeline-event",
        "Get a specific timeline event by ID from HubSpot",
        {
            eventTemplateId: z.string(),
            eventId: z.string(),
        },
        async ({ eventTemplateId, eventId }) => {
            const event = await hubspot.crm.timeline.eventsApi.getById(eventTemplateId, eventId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(event),
                }],
            };
        });

    server.tool("hubspot-get-timeline-events",
        "Get all timeline events by Id from HubSpot",
        {
            eventTemplateId: z.string(),
            eventIds: z.array(z.string()),
        },
        async ({ eventTemplateId, eventIds }) => {
            const events = await Promise.all(eventIds.map(async (id) => {
                const event = await hubspot.crm.timeline.eventsApi.getById(eventTemplateId, id);
                return event;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(events),
                }],
            };
        });

    server.tool("hubspot-create-timeline-event",
        "Create a new timeline event in HubSpot",
        {
            eventTemplateId: z.string(),
            objectId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ eventTemplateId, objectId, properties }) => {
            const event = await hubspot.crm.timeline.eventsApi.create({
                eventTemplateId,
                objectId,
                tokens: properties,
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(event),
                }],
            };
        });

    server.tool("hubspot-update-timeline-event",
        "Update an existing timeline event in HubSpot",
        {
            eventId: z.string(),
            properties: z.record(z.string()),
        },
        async ({ eventId, properties }) => {
            const event = await hubspot.crm.timeline.eventsApi.create({
                eventTemplateId: eventId,
                objectId: properties.objectId || "",
                tokens: properties,
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(event),
                }],
            };
        });

    server.tool("hubspot-delete-timeline-event",
        "Delete a timeline event from HubSpot",
        {
            eventId: z.string(),
        },
        async ({ eventId }) => {
            // Note: HubSpot doesn't provide a direct delete method for timeline events
            return {
                content: [{
                    type: "text",
                    text: "Timeline events cannot be deleted in HubSpot",
                }],
            };
        });

    // Timeline Event Template Operations
    server.tool("hubspot-get-timeline-event-templates",
        "Get all timeline event templates from HubSpot",
        { appId: z.number() },
        async ({ appId }) => {
            const templates = await hubspot.crm.timeline.templatesApi.getAll(appId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(templates),
                }],
            };
        });

    server.tool("hubspot-get-timeline-event-template",
        "Get a specific timeline event template from HubSpot",
        {
            eventTemplateId: z.string(),
            appId: z.number(),
        },
        async ({ eventTemplateId, appId }) => {
            const template = await hubspot.crm.timeline.templatesApi.getById(eventTemplateId, appId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(template),
                }],
            };
        });

    // Timeline Event Search Operations
    server.tool("hubspot-search-timeline-events",
        "Search timeline events in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            // Note: HubSpot doesn't provide a direct search method for timeline events
            return {
                content: [{
                    type: "text",
                    text: "Timeline events cannot be searched directly in HubSpot",
                }],
            };
        });

    // Timeline Event Property Operations
    server.tool("hubspot-get-timeline-event-properties",
        "Get all timeline event properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("timeline_events");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-timeline-event-property",
        "Get a specific timeline event property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("timeline_events", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
}; 