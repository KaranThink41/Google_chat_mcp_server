#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import * as dotenv from 'dotenv';
dotenv.config();
// Environment variables required for OAuth
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error("Required Google OAuth credentials not found in environment variables");
}
class GoogleChatServer {
    server;
    auth;
    chat;
    constructor() {
        this.server = new Server({
            name: "google-chat-server",
            version: "0.1.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Set up OAuth2 client
        this.auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
        this.auth.setCredentials({ refresh_token: REFRESH_TOKEN });
        // Initialize Google Chat API client
        this.chat = google.chat({ version: "v1", auth: this.auth });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "post_text_message",
                    description: "Post a text message to a Google Chat space. Refer to the API documentation: https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/create",
                    inputSchema: {
                        type: "object",
                        properties: {
                            spaceId: { type: "string", description: "The unique ID of the Google Chat space." },
                            text: { type: "string", description: "The text content of the message to be posted." },
                        },
                        required: ["spaceId", "text"],
                    },
                },
                {
                    name: "fetch_member_details",
                    description: "Retrieve detailed membership information from a Google Chat space. See: https://developers.google.com/chat/api/reference/rest/v1/spaces.members/get",
                    inputSchema: {
                        type: "object",
                        properties: {
                            spaceId: { type: "string", description: "The unique ID of the Google Chat space." },
                            memberId: { type: "string", description: "The unique ID of the member." },
                        },
                        required: ["spaceId", "memberId"],
                    },
                },
                {
                    name: "fetch_space_details",
                    description: "Get comprehensive details about a specific Google Chat space. Documentation: https://developers.google.com/chat/api/reference/rest/v1/spaces/get",
                    inputSchema: {
                        type: "object",
                        properties: {
                            spaceId: { type: "string", description: "The unique ID of the Google Chat space." },
                        },
                        required: ["spaceId"],
                    },
                },
                {
                    name: "list_space_memberships",
                    description: "List all memberships in a Google Chat space along with detailed role and membership status. Documentation: https://developers.google.com/chat/api/reference/rest/v1/spaces.members/list",
                    inputSchema: {
                        type: "object",
                        properties: {
                            spaceId: { type: "string", description: "The unique ID of the Google Chat space." },
                            pageSize: { type: "integer", description: "Maximum number of memberships to return (default is 100 if unspecified)." },
                            pageToken: { type: "string", description: "A page token from a previous call to paginate results." },
                            filter: { type: "string", description: "Filter query (e.g., 'role = \"OWNER\"')." },
                            showInvited: { type: "boolean", description: "Include memberships of invited members if true." },
                        },
                        required: ["spaceId"],
                    },
                },
                {
                    name: "list_space_messages",
                    description: "Retrieve a list of messages from a Google Chat space, including those from blocked members and spaces. Refer to: https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/list. Optional filters like 'Monday', 'manager message', 'Rahul message', etc. can be applied via custom logic.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            spaceId: { type: "string", description: "The unique ID of the Google Chat space." },
                            pageSize: { type: "integer", description: "Maximum number of messages to return (default is 25 if unspecified)." },
                            pageToken: { type: "string", description: "A page token from a previous call for pagination." },
                            orderBy: { type: "string", description: "Ordering of messages, e.g., 'createTime' or 'lastUpdateTime'.", enum: ["createTime", "lastUpdateTime"] },
                            filter: { type: "string", description: "Filter messages by criteria such as date, specific keywords (e.g., 'Rahul'), days (e.g., 'Monday') etc. Use custom filter logic if needed." },
                            showDeleted: { type: "boolean", description: "Include deleted messages if set to true." },
                        },
                        required: ["spaceId"],
                    },
                },
                {
                    name: "fetch_message_details",
                    description: "Get detailed information about a specific message in a Google Chat space. See: https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/get",
                    inputSchema: {
                        type: "object",
                        properties: {
                            spaceId: { type: "string", description: "The unique ID of the Google Chat space." },
                            messageId: { type: "string", description: "The unique ID of the message." },
                        },
                        required: ["spaceId", "messageId"],
                    },
                },
                {
                    name: "list_joined_spaces",
                    description: "List all Google Chat spaces that the caller is a member of. Group chats and DMs are listed only after the first message is sent. Documentation: https://developers.google.com/chat/api/reference/rest/v1/spaces/list",
                    inputSchema: {
                        type: "object",
                        properties: {
                            pageSize: { type: "integer", description: "Maximum number of spaces to return (default is 100 if unspecified)." },
                            pageToken: { type: "string", description: "A page token from a previous call to paginate results." },
                            filter: { type: "string", description: "Filter spaces using a query (e.g., 'spaceType = \"SPACE\"')." },
                        },
                    },
                },
                {
                    name: "apply_natural_language_filter",
                    description: "Convert a natural language filter query (e.g., 'Monday', 'Tuesday', 'Rahul message', 'manager message', etc.) into a standardized filter string that can be used with other tools. This tool helps in mapping human-friendly filter terms to API query parameters.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            filterText: { type: "string", description: "The natural language filter query provided by the user." },
                        },
                        required: ["filterText"],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            switch (request.params.name) {
                case "post_text_message":
                    return await this.handleCreateMessage(request.params.arguments);
                case "fetch_member_details":
                    return await this.handleGetMember(request.params.arguments);
                case "fetch_space_details":
                    return await this.handleGetSpace(request.params.arguments);
                case "list_space_memberships":
                    return await this.handleListMembers(request.params.arguments);
                case "list_space_messages":
                    return await this.handleListMessages(request.params.arguments);
                case "fetch_message_details":
                    return await this.handleGetMessage(request.params.arguments);
                case "list_joined_spaces":
                    return await this.handleListSpaces(request.params.arguments);
                case "apply_natural_language_filter":
                    return await this.handleApplyNaturalLanguageFilter(request.params.arguments);
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
        });
    }
    async handleCreateMessage(args) {
        try {
            const { spaceId, text } = args;
            const response = await this.chat.spaces.messages.create({
                parent: `spaces/${spaceId}`,
                requestBody: {
                    text: text,
                },
            });
            return {
                content: [
                    {
                        type: "text",
                        text: `Message created successfully. Message ID: ${response.data.name}`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error creating message: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleGetMember(args) {
        try {
            const { spaceId, memberId } = args;
            const response = await this.chat.spaces.members.get({
                name: `spaces/${spaceId}/members/${memberId}`,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching member details: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleGetSpace(args) {
        try {
            const { spaceId } = args;
            const response = await this.chat.spaces.get({
                name: `spaces/${spaceId}`,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching space details: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleListMembers(args) {
        try {
            const { spaceId, pageSize, pageToken, filter, showInvited } = args;
            const response = await this.chat.spaces.members.list({
                parent: `spaces/${spaceId}`,
                pageSize,
                pageToken,
                filter,
                showInvited,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error listing space memberships: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleListMessages(args) {
        try {
            const { spaceId, pageSize, pageToken, orderBy, filter, showDeleted } = args;
            const response = await this.chat.spaces.messages.list({
                parent: `spaces/${spaceId}`,
                pageSize,
                pageToken,
                orderBy,
                filter,
                showDeleted,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error listing space messages: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleGetMessage(args) {
        try {
            const { spaceId, messageId } = args;
            const response = await this.chat.spaces.messages.get({
                name: `spaces/${spaceId}/messages/${messageId}`,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching message details: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async handleListSpaces(args) {
        try {
            const { pageSize, pageToken, filter } = args;
            const response = await this.chat.spaces.list({
                pageSize,
                pageToken,
                filter,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error listing joined spaces: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    // This tool converts natural language filters into standardized filter strings.
    async handleApplyNaturalLanguageFilter(args) {
        try {
            const { filterText } = args;
            let apiFilter = "";
            // Example custom logic: Convert known keywords into API filter parameters.
            if (/monday/i.test(filterText)) {
                // Assuming Monday messages means messages created on Monday.
                // You would calculate timestamp ranges for Monday here.
                apiFilter += 'createTime >= "2025-03-09T00:00:00Z" AND createTime <= "2025-03-09T23:59:59Z"';
            }
            if (/tuesday/i.test(filterText)) {
                apiFilter += (apiFilter ? " OR " : "") + 'createTime >= "2025-03-10T00:00:00Z" AND createTime <= "2025-03-10T23:59:59Z"';
            }
            if (/rahul message/i.test(filterText)) {
                // Assuming "Rahul" is a keyword in the message text.
                apiFilter += (apiFilter ? " AND " : "") + 'text CONTAINS "Rahul"';
            }
            if (/manager message/i.test(filterText)) {
                // For manager messages, you might need to first resolve which user IDs are managers.
                // Here, we simply add a placeholder filter.
                apiFilter += (apiFilter ? " AND " : "") + 'sender.role = "MANAGER"';
            }
            // Add more custom conversion logic as needed.
            if (!apiFilter) {
                apiFilter = filterText; // Fallback to the original text if no conversion applied.
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Converted filter: ${apiFilter}`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error applying natural language filter: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Google Chat MCP server running on stdio");
    }
}
const server = new GoogleChatServer();
server.run().catch(console.error);
