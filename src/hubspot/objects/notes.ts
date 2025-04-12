import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { z } from "zod";
import { FilterOperatorEnum, AssociationSpecAssociationCategoryEnum } from "@hubspot/api-client/lib/codegen/crm/objects/index.js";

export const hubspotNotesMCP = (server: McpServer, hubspot: hubspot.Client) => {
    // Basic Note Operations
    server.tool("hubspot-get-note",
        "Get a specific note by ID from HubSpot",
        {
            noteId: z.string(),
        },
        async ({ noteId }) => {
            const note = await hubspot.crm.objects.notes.basicApi.getById(noteId);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(note),
                }],
            };
        });

    server.tool("hubspot-get-notes",
        "Get multiple notes by their IDs from HubSpot",
        {
            noteIds: z.array(z.string()),
        },
        async ({ noteIds }) => {
            const notes = await Promise.all(noteIds.map(async (id) => {
                const note = await hubspot.crm.objects.notes.basicApi.getById(id);
                return note;
            }));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(notes),
                }],
            };
        });

    server.tool("hubspot-create-note",
        "Create a new note in HubSpot",
        {
            properties: z.object({
                hs_note_body: z.string(),
                hs_timestamp: z.string().optional(),
                hs_note_status: z.string().optional(),
            }),
            associations: z.array(z.object({
                toObjectType: z.string().describe("The type of object to associate with (e.g. 'contacts', 'companies', 'deals')"),
                toObjectId: z.string().describe("The ID of the object to associate with"),
                associationTypeId: z.number().default(1).describe("The type of association (defaults to 1 for standard association)"),
            })).optional().describe("Optional list of objects to associate this note with"),
        },
        async ({ properties, associations }) => {
            properties.hs_timestamp ??= new Date().toISOString(); 
            const note = await hubspot.crm.objects.notes.basicApi.create({
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
                    text: JSON.stringify(note),
                }],
            };
        });

    server.tool("hubspot-update-note",
        "Update an existing note in HubSpot",
        {
            noteId: z.string(),
            properties: z.object({
                hs_note_body: z.string().optional(),
                hs_timestamp: z.string().optional(),
                hs_note_status: z.string().optional(),
            }),
        },
        async ({ noteId, properties }) => {
            properties.hs_timestamp ??= new Date().toISOString(); 
            const note = await hubspot.crm.objects.notes.basicApi.update(noteId, {
                properties
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(note),
                }],
            };
        });

    server.tool("hubspot-delete-note",
        "Delete a note from HubSpot",
        {
            noteId: z.string(),
        },
        async ({ noteId }) => {
            await hubspot.crm.objects.notes.basicApi.archive(noteId);
            return {
                content: [{
                    type: "text",
                    text: "Note deleted successfully",
                }],
            };
        });

    // Note Search Operations
    server.tool("hubspot-search-notes",
        "Search notes in HubSpot using various criteria",
        {
            searchTerm: z.string(),
            propertyName: z.string(),
            operator: z.nativeEnum(FilterOperatorEnum),
            limit: z.number().optional().default(10),
            after: z.string().optional(),
            properties: z.array(z.string()).optional(),
        },
        async ({ searchTerm, propertyName, operator, limit, after, properties }) => {
            const searchResponse = await hubspot.crm.objects.notes.searchApi.doSearch({
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

    // Note Property Operations
    server.tool("hubspot-get-note-properties",
        "Get all note properties from HubSpot",
        {},
        async () => {
            const properties = await hubspot.crm.properties.coreApi.getAll("notes");
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(properties),
                }],
            };
        });

    server.tool("hubspot-get-note-property",
        "Get a specific note property from HubSpot",
        {
            propertyName: z.string(),
        },
        async ({ propertyName }) => {
            const property = await hubspot.crm.properties.coreApi.getByName("notes", propertyName);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(property),
                }],
            };
        });
}; 