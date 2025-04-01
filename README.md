# Google Workspace MCP Server

[![smithery badge](https://smithery.ai/badge/@rishipradeep-think41/gsuite-mcp)](https://smithery.ai/server/@rishipradeep-think41/gsuite-mcp)

A Model Context Protocol (MCP) server that provides tools for interacting with Gmail and Calendar APIs. This server enables you to manage your emails and calendar events programmatically through the MCP interface.

## Features

### Gmail Tools
- `list_emails`: List recent emails from your inbox with optional filtering
- `search_emails`: Advanced email search with Gmail query syntax
- `send_email`: Send new emails with support for CC and BCC
- `modify_email`: Modify email labels (archive, trash, mark read/unread)

### Calendar Tools
- `list_events`: List upcoming calendar events with date range filtering
- `create_event`: Create new calendar events with attendees
- `update_event`: Update existing calendar events
- `delete_event`: Delete calendar events

## Prerequisites

1. **Node.js**: Install Node.js version 14 or higher
2. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API and Google Calendar API:
     1. Go to "APIs & Services" > "Library"
     2. Search for and enable "Gmail API"
     3. Search for and enable "Google Calendar API"
   - Set up OAuth 2.0 credentials:
     1. Go to "APIs & Services" > "Credentials"
     2. Click "Create Credentials" > "OAuth client ID"
     3. Choose "Web application"
     4. Set "Authorized redirect URIs" to include: `http://localhost:4100/code`
     5. Note down the Client ID and Client Secret


### Installing Manually
1. **Clone and Install**:
   ```bash
   git clone https://github.com/KaranThink41/Google_workspace_mcp_server.git
   cd Google_workspace_mcp_server
   npm install
   ```

2. **Create OAuth Credentials**:
   Create a `credentials.json` file in the root directory:
   ```json
   {
       "web": {
           "client_id": "YOUR_CLIENT_ID",
           "client_secret": "YOUR_CLIENT_SECRET",
           "redirect_uris": ["http://localhost:3000/auth/callback"],
           "auth_uri": "https://accounts.google.com/o/oauth2/auth",
           "token_uri": "https://oauth2.googleapis.com/token"
       }
   }
   ```

3. **Get Refresh Token**:
   ```bash
   node get-refresh-token.js
   ```
   This will:
   - Open your browser for Google OAuth authentication
   - Request the following permissions:
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/gmail.send`
   - Save the credentials to `token.json`
   - Display the refresh token in the console

4. **Configure MCP Settings**:
   Add the server configuration to your MCP settings file:
   - For VSCode Claude extension: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - For Claude desktop app: `~/Library/Application Support/Claude/claude_desktop_config.json`

   Add this to the `mcpServers` object:
   ```json
   {
     "mcpServers": {
       "google-workspace": {
         "command": "node",
         "args": ["/path/to/google-workspace-server/build/index.js"],
         "env": {
           "GOOGLE_CLIENT_ID": "your_client_id",
           "GOOGLE_CLIENT_SECRET": "your_client_secret",
           "GOOGLE_REFRESH_TOKEN": "your_refresh_token"
         }
       }
     }
   }
   ```

5. **Build and Run**:
   ```bash
   npm run build
   ```

## Usage Examples

### Gmail Operations

1. **List Recent Emails**:
   ```json
   {
     "maxResults": 5,
     "query": "is:unread"
   }
   ```

2. **Search Emails**:
   ```json
   {
     "query": "from:example@gmail.com has:attachment",
     "maxResults": 10
   }
   ```

3. **Send Email**:
   ```json
   {
     "to": "recipient@example.com",
     "subject": "Hello",
     "body": "Message content",
     "cc": "cc@example.com",
     "bcc": "bcc@example.com"
   }
   ```

4. **Modify Email**:
   ```json
   {
     "id": "message_id",
     "addLabels": ["UNREAD"],
     "removeLabels": ["INBOX"]
   }
   ```

### Calendar Operations

1. **List Events**:
   ```json
   {
     "maxResults": 10,
     "timeMin": "2024-01-01T00:00:00Z",
     "timeMax": "2024-12-31T23:59:59Z"
   }
   ```

2. **Create Event**:
   ```json
   {
     "summary": "Team Meeting",
     "location": "Conference Room",
     "description": "Weekly sync-up",
     "start": "2024-01-24T10:00:00Z",
     "end": "2024-01-24T11:00:00Z",
     "attendees": ["colleague@example.com"]
   }
   ```

3. **Update Event**:
   ```json
   {
     "eventId": "event_id",
     "summary": "Updated Meeting Title",
     "location": "Virtual",
     "start": "2024-01-24T11:00:00Z",
     "end": "2024-01-24T12:00:00Z"
   }
   ```

4. **Delete Event**:
   ```json
   {
     "eventId": "event_id"
   }
   ```

## Troubleshooting

1. **Authentication Issues**:
   - Ensure all required OAuth scopes are granted
   - Verify client ID and secret are correct
   - Check if refresh token is valid

2. **API Errors**:
   - Check Google Cloud Console for API quotas and limits
   - Ensure APIs are enabled for your project
   - Verify request parameters match the required format

## License

This project is licensed under the MIT License.

# Google Chat MCP Server

A Model Context Protocol (MCP) server implementation for interacting with Google Chat API. This server provides tools for managing messages, spaces, and memberships in Google Chat.

## Features

- Post text messages to Google Chat spaces
- Get space details and list spaces
- Manage memberships (list, get member details)
- List and retrieve messages with filtering capabilities
- Natural language filtering support

## Prerequisites

- Node.js (LTS version)
- Google Cloud Project with Google Chat API enabled
- Google OAuth 2.0 credentials
- Docker (optional, for container deployment)

## Setup Instructions

### 1. Google Cloud Project Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Chat API
4. Create OAuth 2.0 credentials:
   - Go to API & Services > Credentials
   - Click "Create Credentials" > OAuth client ID
   - Select "Desktop app" as the application type
   - Note down the Client ID and Client Secret

### 2. Get Refresh Token

1. Create a temporary credentials file:
```bash
cp temp-credentials.json.example temp-credentials.json
```

2. Update the `temp-credentials.json` with your Client ID and Client Secret

3. Run the refresh token script:
```bash
node get-refresh-token.js
```

4. Follow the browser authentication flow to get the refresh token

### 3. Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your credentials:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
SPACE_ID=your_space_id
```

### 4. Local Development

1. Clone the repository:
```bash
git clone https://github.com/KaranThink41/Google_chat_mcp_server.git
cd Google_chat_mcp_server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run the server:
```bash
node build/index.js
```

## Available Tools

### Message Management
- `post_text_message`: Post a text message to a Google Chat space
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "post_text_message",
      "arguments": {
        "spaceId": "AAAAfkdUqxE",
        "text": "Hello, this is a test message!"
      }
    }
  }
  ```

- `fetch_message_details`: Get detailed information about a specific message
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "fetch_message_details",
      "arguments": {
        "spaceId": "AAAAfkdUqxE",
        "messageId": "cpwLU-2f_z8.cpwLU-2f_z8"
      }
    }
  }
  ```

- `list_space_messages`: List messages in a space with optional filtering
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "list_space_messages",
      "arguments": {
        "spaceId": "AAAAfkdUqxE",
        "pageSize": 10,
        "orderBy": "createTime"
      }
    }
  }
  ```

### Space Management
- `fetch_space_details`: Get comprehensive details about a space
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "fetch_space_details",
      "arguments": {
        "spaceId": "AAAAfkdUqxE"
      }
    }
  }
  ```

- `list_joined_spaces`: List all spaces the caller is a member of
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "list_joined_spaces",
      "arguments": {
        "pageSize": 10
      }
    }
  }
  ```

### Membership Management
- `list_space_memberships`: List all memberships in a space
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "list_space_memberships",
      "arguments": {
        "spaceId": "AAAAfkdUqxE",
        "pageSize": 10
      }
    }
  }
  ```

- `fetch_member_details`: Get detailed information about a specific member
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "fetch_member_details",
      "arguments": {
        "spaceId": "AAAAfkdUqxE",
        "memberId": "user_123"
      }
    }
  }
  ```

### Natural Language Filtering
- `apply_natural_language_filter`: Convert natural language queries into API filter strings
  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "apply_natural_language_filter",
      "arguments": {
        "filterText": "messages from Monday"
      }
    }
  }
  ```

## Error Handling

The server implements proper error handling with descriptive error messages. Common errors include:
- Authentication failures
- Invalid space IDs
- Rate limiting
- API quota exceeded

## Security

- All sensitive credentials are stored in environment variables
- OAuth refresh tokens are securely managed
- API keys are never exposed in the code

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
