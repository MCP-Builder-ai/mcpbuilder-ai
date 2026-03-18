# mcpbuilder-ai

**Connect your apps to AI-powered MCP servers — in minutes, not months.**

`mcpbuilder-ai` is the official SDK for [MCP-Builder.ai](https://mcp-builder.ai/), available for both **Python** and **TypeScript**. It lets you stream chat responses, execute tools with consent handling, and manage authentication — all through a clean, callback-driven API over WebSockets.

Build your MCP server on the [MCP-Builder.ai](https://mcp-builder.ai/) dashboard, grab your project token, and start talking to it from any app with just a few lines of code.

---

## How It Works

```
┌─────────────────────┐         ┌──────────────────────────┐
│   Your Application  │  SDK    │   MCP-Builder.ai Cloud   │
│                     │ ─────►  │                          │
│  - Web frontend     │  WS     │  - MCP Server you built  │
│  - CLI tool         │ ◄─────  │  - Tool execution        │
│  - Backend service  │         │  - LLM orchestration     │
└─────────────────────┘         └──────────────────────────┘
```

1. **Design** your MCP server on [mcp-builder.ai](https://mcp-builder.ai/) — configure tools, connect APIs, set up authentication.
2. **Install** the SDK (`pip install mcpbuilder-ai` / `npm install mcpbuilder-ai`).
3. **Connect** with your project token and deployment name.
4. **Chat** — stream tokens in real time, handle tool calls, manage consent flows.

---

## Features

| | Python | TypeScript |
|---|---|---|
| Real-time token streaming | ✅ | ✅ |
| Fluent callback API | ✅ | ✅ |
| Tool consent handling | ✅ | ✅ |
| Auto-reconnect with backoff | ✅ | ✅ |
| Session & history management | ✅ | ✅ |
| Security parameter overrides | ✅ | ✅ |
| Full type safety | ✅ (type hints) | ✅ (TypeScript generics) |
| ESM + CommonJS | — | ✅ |

---

## Quick Start

### TypeScript

```bash
npm install mcpbuilder-ai
```

```typescript
import { MCPChatClient } from 'mcpbuilder-ai';

const client = new MCPChatClient({
  projectToken: 'your-project-token',
  deploymentName: 'my-deployment',
  cacheHistory: false,
});

client
  .onToken((token) => process.stdout.write(token))
  .onFinal((text, toolCalls) => console.log('\nDone!'))
  .onError((error) => console.error('Error:', error));

await client.connect();
await client.sendMessage('Hello, what can you do?');
```

### Python

```bash
pip install mcpbuilder-ai
```

```python
import asyncio
from mcpbuilder import MCPChatClient

async def main():
    client = MCPChatClient(
        project_token="your-project-token",
        deployment_name="my-deployment",
        cache_history=False,
    )

    client \
        .on_token(lambda t: print(t, end="", flush=True)) \
        .on_final(lambda text, tc: print("\nDone!")) \
        .on_error(lambda msg: print(f"Error: {msg}"))

    await client.connect()
    await client.send_message("Hello, what can you do?")

asyncio.run(main())
```

---

## SDK Documentation

| SDK | Package | Docs |
|-----|---------|------|
| TypeScript | [`mcpbuilder-ai` on npm](https://www.npmjs.com/package/mcpbuilder-ai) | [TypeScript README](./typescript-sdk/README.md) |
| Python | [`mcpbuilder-ai` on PyPI](https://pypi.org/project/mcpbuilder-ai/) | [Python README](./python-sdk/README.md) |

---

## Integration Examples

The [examples](./examples/) directory contains ready-to-run projects showing how to connect to MCP servers built on [MCP-Builder.ai](https://mcp-builder.ai/):

| Example | Language | Description |
|---------|----------|-------------|
| [React MCP Chat](./examples/typescript/react-mcp-chat/) | TypeScript | React-based chat UI with streaming + tool consent |
| [Simple Python CLI](./examples/python/simple-python-cli/) | Python | Terminal chat client with live token streaming |

> **New to MCP-Builder.ai?** Check the [Getting Started guide](./examples/mcp-usecase/README.md) to create your first project and grab a project token.

---

## Getting Started with MCP-Builder.ai

1. **Sign up** at [mcp-builder.ai](https://mcp-builder.ai/) and open the dashboard.
2. **Create a project** — define your tools, connect external APIs, and configure authentication.
3. **Deploy** your MCP server with one click.
4. **Copy** the project token and deployment name from the dashboard.
5. **Install** the SDK and paste the credentials into your app — you're live.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

Apache-2.0 — see [LICENSE] for details.
