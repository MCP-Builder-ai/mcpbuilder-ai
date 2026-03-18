# mcpbuilder-ai

TypeScript SDK for MCPBuilder - A fluent, type-safe client for building AI chat applications with MCP (Model Context Protocol) support.

## Features

- 🔒 **Type-safe**: Full TypeScript support with comprehensive type definitions
- 🔄 **Streaming**: Real-time token streaming with callback handlers
- 🔌 **Auto-reconnect**: Automatic WebSocket reconnection with exponential backoff
- 🛠️ **Fluent API**: Chainable callback registration for clean, readable code
- 📦 **Dual format**: Supports both ESM and CommonJS
- 🎯 **Consent handling**: Built-in support for tool consent flows

## Installation

```bash
npm install mcpbuilder-ai
```

Or with your preferred package manager:

```bash
yarn add mcpbuilder-ai
pnpm add mcpbuilder-ai
bun add mcpbuilder-ai
```

## Quick Start

```typescript
import { MCPChatClient } from 'mcpbuilder-ai';

const client = new MCPChatClient({
  projectToken: 'project-token',
  deploymentName: 'my-deployment',
  cacheHistory: false,              // Set to true to persist history on server
});

// Register callbacks using fluent API
client
  .onToken((token) => process.stdout.write(token))
  .onFinal((text, toolCalls) => console.log('\nDone!'))
  .onError((error) => console.error('Error:', error));

// Connect and send a message
await client.connect();
await client.sendMessage('Hello, how can you help me today?');

// When done
await client.disconnect();
```

## Usage

### Basic Configuration

```typescript
import { MCPChatClient, MCPChatClientConfig } from 'mcpbuilder-ai';

const options: MCPChatClientConfig = {
  projectToken: 'your-project-token',
  deploymentName: 'my-deployment',
  cacheHistory: false,                           // Set to true to persist history on server
  // Optional: Security parameters that override loaded credentials
  securityParams: {
    'X-API-KEY': process.env.MY_API_KEY!,
    'Authorization': `Bearer ${process.env.MY_ACCESS_TOKEN}`,
  },
  maxReconnectAttempts: 5,          // Default: 5
  reconnectDelayMs: 2000,            // Default: 2000
  systemMessage: 'You are a helpful assistant',  // Optional
  language: 'English',               // Optional
};

const client = new MCPChatClient(options);
```

### Callback Handlers

The SDK uses a fluent callback pattern for handling different event types:

```typescript
client
  // Streaming tokens as they arrive
  .onToken((token: string) => {
    process.stdout.write(token);
  })

  // Final complete response with tool calls
  .onFinal((text: string, toolCalls: ToolCallEntry[]) => {
    console.log('Complete message:', text);
    console.log('Tool calls:', toolCalls.length);
  })

  // Tool execution events
  .onToolStart((event: ToolStartEvent) => {
    console.log(`Starting tool: ${event.tool_name}`);
  })
  .onToolResult((event: ToolResultEvent) => {
    console.log(`Tool result: ${event.tool_name}`, event.result);
  })

  // Tool consent requests
  .onConsent((request: ConsentRequest) => {
    console.log('Tool requires consent:', request.tool_name);
    // Handle consent - see Consent Handling section
  })

  // Connection events
  .onConnectionOpen(() => console.log('Connected'))
  .onConnectionClose((code, reason) => console.log('Disconnected:', code, reason))

  // Error handling
  .onError((error: ErrorEvent) => {
    console.error('Error:', error.error);
  });
```

### Consent Handling

When a tool requires user consent, handle it appropriately:

```typescript
client.onConsent(async (request) => {
  console.log(`Tool "${request.tool_name}" needs consent`);
  console.log('Description:', request.tool_description);

  // In a real app, prompt the user
  const userApproved = await promptUser(request);

  await client.respondConsent(
    request.tool_id,
    request.tool_name,
    userApproved ? 'approve' : 'deny'
  );
});
```

### Message History

You can provide default conversation history in the constructor, or override history per message. This is useful for resuming conversations or providing context:

```typescript
import { MCPChatClient, HistoryMessage } from 'mcpbuilder-ai';

const history: HistoryMessage[] = [
  { role: 'user', content: 'What is the capital of France?' },
  { role: 'assistant', content: 'The capital of France is Paris.' },
];

const client = new MCPChatClient({
  projectToken: 'your-token',
  deploymentName: 'my-deployment',
  messageHistory: history,
  cacheHistory: false,              // Set to true to persist history on server
});

await client.connect();

// Optional: override history for this specific message
await client.sendMessage('What about Germany?', { messageHistory: history });
```

The history is sent to the server and prepended to the conversation after the system message, before any new messages.

### Lifecycle Management

```typescript
// Connect to the WebSocket server
await client.connect();

// Send messages
await client.sendMessage('Your message here');

// Check connection status
if (client.isConnected) {
  // ...
}

// Disconnect when done
client.disconnect();
```

### Helper Functions

The SDK provides helper functions for working with events:

```typescript
import { parseServerEvent, createMessage, createConsentResponse } from 'mcpbuilder-ai';

// Parse and type-narrow server events
const event = parseServerEvent(rawData);
if (event) {
  switch (event.type) {
    case 'token':
      console.log(event.token);
      break;
    case 'final':
      console.log(event.message);
      break;
  }
}

// Create properly typed messages
const message = createMessage('Hello');
const consent = createConsentResponse('tool-123', 'my_tool', 'approve');
```

## API Reference

### MCPChatClient

Main client class for interacting with the MCP chat service.

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectToken` | `string` | required | Authentication token for the project |
| `deploymentName` | `string` | required | Deployment identifier |
| `securityParams` | `Record<string, string>` | `undefined` | Security headers to merge with loaded credentials |
| `autoReconnect` | `boolean` | `true` | Enable automatic reconnection |
| `maxReconnectAttempts` | `number` | `5` | Maximum reconnection attempts |
| `reconnectDelayMs` | `number` | `2000` | Base delay between reconnections (ms) |
| `systemMessage` | `string` | `undefined` | System message/prompt for the LLM |
| `language` | `string` | `undefined` | Language setting for the assistant |
| `messageHistory` | `HistoryMessage[]` | `undefined` | Initial conversation history to prepend |
| `cacheHistory` | `boolean` | `false` | Whether to cache conversation history on the server |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `connect()` | `Promise<void>` | Establish WebSocket connection |
| `disconnect()` | `void` | Close connection |
| `sendMessage(content, options?)` | `Promise<void>` | Send a chat message |
| `respondConsent(toolId, toolName, action)` | `Promise<void>` | Respond to consent request |
| `isConnected` | `boolean` | Connection status getter |

## Examples

See the [examples](./examples) directory for complete working examples:

- **[basic-usage.ts](./examples/basic-usage.ts)** - Simple chat interaction
- **[cli-chat.ts](./examples/cli-chat.ts)** - Interactive CLI chat application
- **[service-integration.ts](./examples/service-integration.ts)** - Backend service integration

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests.

## License

Apache-2.0 - See [LICENSE](./LICENSE) for details.
