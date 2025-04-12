import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import hubspot from '@hubspot/api-client';
import { hubspotCallsMCP } from './calls.js';
import { hubspotCommunicationsMCP } from './communications.js';
import { hubspotEmailsMCP } from './emails.js';
import { hubspotFeedbackSubmissionsMCP } from './feedback-submissions.js';
import { hubspotNotesMCP } from './notes.js';
import { hubspotTaxMCP } from './tax.js';
import { hubspotLeadsMCP } from "./leads.js";
import { hubspotTasksMCP } from "./tasks.js";
import { hubspotMeetingsMCP } from "./meetings.js";
import { hubspotGoalsMCP } from "./goals.js";
import { hubspotPostalMailMCP } from "./postal-mail.js";

export const hubspotObjectsMCP = (server: McpServer, hubspot: hubspot.Client) => {
    hubspotCallsMCP(server, hubspot);
    hubspotCommunicationsMCP(server, hubspot);
    hubspotEmailsMCP(server, hubspot);
    hubspotFeedbackSubmissionsMCP(server, hubspot);
    hubspotNotesMCP(server, hubspot);
    hubspotTaxMCP(server, hubspot);
    hubspotLeadsMCP(server, hubspot);
    hubspotGoalsMCP(server, hubspot);
    hubspotMeetingsMCP(server, hubspot);
    hubspotPostalMailMCP(server, hubspot);
    hubspotTasksMCP(server, hubspot);
}; 