# MCPBuilder Python SDK

A Python SDK for integrating MCPBuilder's MCP agent chat service into your applications.

## Overview

The MCPBuilder Python SDK provides a simple, callback-based interface to connect to the MCP client service and interact with AI agents that can execute tools via the Model Context Protocol (MCP).

## Features

- **WebSocket-based real-time communication** - Stream tokens and events in real-time
- **Callback-based event handling** - Clean fluent API for registering event handlers
- **Tool consent handling** - Allow or deny tool executions programmatically
- **Automatic reconnection** - Handle connection drops gracefully with exponential backoff
- **Session management** - Create, reuse, and manage chat sessions
- **Type-safe** - Full type hints for IDE support

## Requirements

- Python 3.10+
- A valid `project_token` for authentication
- A valid `deployment_name` configured in your MCPBuilder setup

## Installation

### Using pip

```bash
pip install mcpbuilder-ai
```

### Using Poetry

```bash
poetry add mcpbuilder-ai
```

### From Source

```bash
git clone <repository-url>
cd python-sdk
poetry install
```

## Quick Start

### 1. Environment Setup

Set the required environment variables:

```bash
export PROJECT_TOKEN=your-project-token               # Authentication token
export DEPLOYMENT_NAME=your-deployment                # Deployment identifier
```

### 2. Basic Usage

```python
import asyncio
import os
from mcpbuilder import MCPChatClient


async def main():
    # Create client - pass all configuration at initialization
    client = MCPChatClient(
        project_token=os.getenv("PROJECT_TOKEN"),
        deployment_name=os.getenv("DEPLOYMENT_NAME"),
        cache_history=False,  # Set to True to persist history on server
        # Optional: provide security params that override loaded credentials
        # security_params={
        #     "X-API-KEY": os.getenv("MY_API_KEY"),
        #     "Authorization": f"Bearer {os.getenv('MY_ACCESS_TOKEN')}",
        # }
    )
    
    # Register callbacks to handle events
    client \
        .on_token(lambda text: print(text, end="", flush=True)) \
        .on_final(lambda text, tool_calls: print("\n\n✓ Done")) \
        .on_error(lambda msg: print(f"\n❌ Error: {msg}"))
    
    # Connect - all configuration already set
    await client.connect()
    
    # Send a message
    await client.send_message("Hello! What can you help me with?")
    
    # Wait for response (in real app, use proper event handling)
    await asyncio.sleep(30)
    
    # Disconnect when done
    await client.disconnect()


asyncio.run(main())
```

### 3. Security Parameters

The SDK supports passing security parameters (API keys, tokens, etc.) at initialization.
These parameters are merged with credentials loaded from the chatbot settings, with SDK
parameters taking precedence:

```python
# Provide your own credentials that don't need to be fetched from secret service
client = MCPChatClient(
    project_token=os.getenv("PROJECT_TOKEN"),
    deployment_name="my-deployment",
    cache_history=False,  # Set to True to persist history on server
    security_params={
        # Header name -> value pairs that will be sent to the MCP server
        "X-API-KEY": os.getenv("MY_EXTERNAL_API_KEY"),
        "Authorization": f"Bearer {os.getenv('MY_OAUTH_TOKEN')}",
        "X-Custom-Header": "custom-value",
    }
)
```

This is useful when:
- You have credentials available locally (e.g., from environment variables)
- You want to override credentials loaded from MCPBuilder settings
- You need to provide credentials that aren't stored in the secret service

### 3. Interactive Chat Example

```python
import asyncio
import os
from mcpbuilder import MCPChatClient


async def main():
    client = MCPChatClient(
        project_token=os.getenv("PROJECT_TOKEN"),
        deployment_name=os.getenv("DEPLOYMENT_NAME"),
        cache_history=False,  # Set to True to persist history on server
    )
    
    # Track when response is complete
    response_done = asyncio.Event()
    
    # Register all callbacks
    client \
        .on_connected(lambda sid: print(f"✓ Connected (session: {sid})")) \
        .on_token(lambda text: print(text, end="", flush=True)) \
        .on_tool_start(lambda name, args: print(f"\n🔧 Calling: {name}")) \
        .on_tool_end(lambda name, output, ok, err: print(f"\n{'✓' if ok else '✗'} {name}")) \
        .on_final(lambda text, tool_calls: response_done.set()) \
        .on_error(lambda msg: print(f"\n❌ {msg}")) \
        .on_disconnected(lambda reason: print(f"\n🔌 Disconnected: {reason}"))
    
    await client.connect(timezone="Europe/Berlin")
    
    print("\nType your message (or 'quit' to exit):\n")
    
    while True:
        user_input = input("You: ")
        
        if user_input.lower() == "quit":
            break
        
        response_done.clear()
        print("\nAssistant: ", end="", flush=True)
        
        await client.send_message(user_input)
        await asyncio.wait_for(response_done.wait(), timeout=120)
        print()
    
    await client.disconnect()


asyncio.run(main())
```

### 4. Tool Consent Handling

When the agent wants to execute tools, you can control approval:

```python
import asyncio
import os
from mcpbuilder import MCPChatClient


async def main():
    client = MCPChatClient(
        project_token=os.getenv("PROJECT_TOKEN"),
        deployment_name="my-deployment",
        cache_history=False,  # Set to True to persist history on server
    )
    
    # Define consent handler
    async def handle_consent(consent_id: str, tool: str, args: dict, description: str):
        print(f"\n🔐 Tool '{tool}' requests permission")
        print(f"   Arguments: {args}")
        
        # Option 1: Auto-approve specific tools
        if tool in ["search", "get_time", "list_files"]:
            await client.respond_consent(consent_id, allow=True)
            return
        
        # Option 2: Ask user
        response = input("   Allow? (y/n/a=allow all): ").lower()
        
        if response == "a":
            await client.respond_consent(consent_id, allow=True, allow_all=True)
        elif response == "y":
            await client.respond_consent(consent_id, allow=True)
        else:
            await client.respond_consent(consent_id, allow=False)
    
    # Register the consent callback
    client.on_tool_consent_request(
        lambda cid, tool, args, desc: asyncio.create_task(
            handle_consent(cid, tool, args, desc)
        )
    )
    
    # ... rest of setup
    await client.connect()


asyncio.run(main())
```

### 4. Auto-Approve All Tools

If you trust all tools in your deployment:

```python
# After connecting, enable auto-consent
await client.connect()  # deployment_name is set in constructor
await client.set_consent_all(enabled=True)

# Or allow specific tools only
await client.allow_tool("search")
await client.allow_tool("get_weather")
```

## Configuration

The SDK uses environment variables for configuration, with optional explicit overrides.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PROJECT_TOKEN` | Yes | Authentication token for your project |
| `DEPLOYMENT_NAME` | Yes | Your deployment identifier |
| `TIMEZONE` | No | Client timezone (default: UTC) |

### Configuration Examples

**Standard usage (environment variables):**
```python
import os
from mcpbuilder import MCPChatClient

client = MCPChatClient(
    project_token=os.getenv("PROJECT_TOKEN"),
    deployment_name=os.getenv("DEPLOYMENT_NAME"),
    cache_history=False,            # Set to True to persist history on server
    auto_reconnect=True,
    max_reconnect_attempts=5,
)
await client.connect(timezone="Europe/Berlin")
```

```

### Client Options

```python
import os
from mcpbuilder import MCPChatClient

client = MCPChatClient(
    project_token=os.getenv("PROJECT_TOKEN"),  # Required: Authentication token
    deployment_name=os.getenv("DEPLOYMENT_NAME"),  # Required: Deployment identifier
    cache_history=False,                        # Cache history on server (default: False)
    auto_reconnect=True,                        # Enable automatic reconnection (default: True)
    max_reconnect_attempts=5,                   # Max reconnection attempts (default: 5)
    reconnect_delay_ms=2000,                    # Base delay for exponential backoff (default: 2000)
)
```

### Connect Options

```python
await client.connect(
    timezone="Europe/Berlin",           # Optional: Client timezone
)
```

Note: `deployment_name`, `message_history`, and `cache_history` are configured in the constructor.

### Message History

You can provide default conversation history in the constructor, or override history per message. This is useful for resuming conversations or providing context:

```python
from mcpbuilder import MCPChatClient, HistoryMessage

# Create history messages
history = [
    HistoryMessage(role="user", content="What is the capital of France?"),
    HistoryMessage(role="assistant", content="The capital of France is Paris."),
]

client = MCPChatClient(
    project_token=os.getenv("PROJECT_TOKEN"),
    deployment_name="my-deployment",
    message_history=history,
    cache_history=False,  # Set to True to persist history on server
)

# Connect (history is already configured)
await client.connect()

# Optional: override history for this specific message
await client.send_message("What about Germany?", message_history=history)
```

The history is sent to the server and prepended to the conversation after the system message, before any new messages. Messages are converted to the appropriate LangChain message types (`HumanMessage`/`AIMessage`) on the server.

### LLM Configuration

You can configure the LLM behavior using setter methods before connecting:

```python
import os
from mcpbuilder import MCPChatClient

client = MCPChatClient(
    project_token=os.getenv("PROJECT_TOKEN"),
    deployment_name="my-deployment",
    cache_history=False,  # Set to True to persist history on server
)

# Configure LLM system message and language
client \
    .set_system_message("You are an expert assistant in Olympic sports. Answer questions accurately and concisely.") \
    .set_language("English")

# Then connect
await client.connect()
```

## API Reference

### MCPChatClient

The main client class for interacting with the MCP service.

#### Constructor

```python
MCPChatClient(
    project_token: str,                 # Required: Authentication token
    deployment_name: str,               # Required: Deployment identifier
    security_params: dict | None = None,# Optional: Security headers to merge
    system_message: str | None = None,  # Optional: System prompt
    language: str | None = None,        # Optional: Assistant language
    message_history: List[HistoryMessage] | None = None,  # Optional: Initial history
    cache_history: bool = False,        # Optional: Cache history on server
    auto_reconnect: bool = True,        # Enable auto-reconnect
    max_reconnect_attempts: int = 5,    # Max retry attempts
    reconnect_delay_ms: int = 2000,     # Base delay (exponential backoff)
)
```

#### Connection Methods

| Method | Description |
|--------|-------------|
| `connect(timezone?)` | Connect to the service |
| `disconnect()` | Disconnect from the service |
| `is_connected` | Property: Check connection status |
| `session_id` | Property: Current session ID (after connect) |

#### Configuration Methods

| Method | Description |
|--------|-------------|
| `set_system_message(message)` | Set system message/prompt for the LLM |
| `set_language(language)` | Set language for the assistant |

#### Message Methods

| Method | Description |
|--------|-------------|
| `send_message(text, message_history?)` | Send a chat message |
| `stop()` | Stop the current agent run |

#### Consent Methods

| Method | Description |
|--------|-------------|
| `respond_consent(consent_id, allow, allow_all?)` | Respond to consent request |
| `set_consent_all(enabled)` | Enable/disable auto-consent for all tools |
| `allow_tool(tool_name)` | Auto-allow a specific tool |

#### Callback Registration (Fluent API)

All callback methods return `self` for chaining:

```python
client \
    .on_connected(callback) \
    .on_token(callback) \
    .on_tool_start(callback) \
    .on_tool_end(callback) \
    .on_tool_consent_request(callback) \
    .on_consent_timeout(callback) \
    .on_final(callback) \
    .on_error(callback) \
    .on_status(callback) \
    .on_disconnected(callback)
```

### Callback Signatures

| Callback | Signature | Description                             |
|----------|-----------|-----------------------------------------|
| `on_connected` | `(session_id: str) -> None` | Connection established                  |
| `on_token` | `(text: str) -> None` | Streaming token received                |
| `on_tool_start` | `(name: str, input: dict) -> None` | Tool execution starting                 |
| `on_tool_end` | `(name: str, output: str, success: bool, error: Optional[str]) -> None` | Tool execution completed                |
| `on_tool_consent_request` | `(consent_id: str, tool: str, args: dict, description: Optional[str]) -> None` | Tool consent needed                     |
| `on_consent_timeout` | `(consent_id: str) -> None` | Consent request timed out               |
| `on_final` | `(text: str, tool_calls: List[Dict[str, Any]]) -> None` | Final complete response with tool calls |
| `on_error` | `(message: str) -> None` | Error occurred                          |
| `on_status` | `(message: str) -> None` | Status update                           |
| `on_disconnected` | `(reason: Optional[str]) -> None` | Disconnected                            |

### Server Event Types

The SDK handles these event types from the server:

| Event Type | Description |
|------------|-------------|
| `status` | Status update (including `initialized` with session_id) |
| `token` | Streaming text token from agent response |
| `tool_start` | Tool invocation started |
| `tool_end_success` | Tool completed successfully |
| `tool_end_failure` | Tool failed |
| `tool_denied` | Tool was denied by user |
| `tool_error` | Tool execution error |
| `tool_consent_request` | Request for tool consent |
| `consent_timeout` | Consent request timed out |
| `final` | Final complete response |
| `error` | Error occurred |
| `closing` | Server closing connection |
| `connection_closed` | Connection closed |

## Examples

See the `examples/` directory for complete examples:

| Example | Description |
|---------|-------------|
| [callback_chat.py](examples/callback_chat.py) | Interactive chat with MCPChatClient |
| [cli_chat.py](examples/cli_chat.py) | Command-line chat interface |
| [service_integration.py](examples/service_integration.py) | Programmatic usage patterns |

### Running Examples

```bash
cd python-sdk

# Install dependencies
poetry install

# Set required environment variables
export PROJECT_TOKEN=your-project-token
export DEPLOYMENT_NAME=my-deployment

# Run interactive chat
poetry run python examples/callback_chat.py
```

## Error Handling

### Connection Errors

The SDK automatically handles reconnection with exponential backoff:

```python
import os
from mcpbuilder import MCPChatClient

client = MCPChatClient(
    project_token=os.getenv("PROJECT_TOKEN"),
    deployment_name=os.getenv("DEPLOYMENT_NAME"),
    cache_history=False,        # Set to True to persist history on server
    auto_reconnect=True,
    max_reconnect_attempts=5,
    reconnect_delay_ms=2000,  # 2s, 4s, 6s, 8s, 10s
)

client.on_error(lambda msg: print(f"Error: {msg}"))
client.on_disconnected(lambda reason: print(f"Disconnected: {reason}"))
```
```

### Handling Specific Errors

```python
client.on_error(lambda msg: handle_error(msg))

def handle_error(message: str):
    if "authentication" in message.lower():
        print("Check your deployment_name")
    elif "timeout" in message.lower():
        print("Request timed out, try again")
    else:
        print(f"Error: {message}")
```

## Development

### Setup Development Environment

```bash
cd python-sdk
poetry install --with dev
```

### Run Tests

```bash
poetry run pytest
```

### Code Quality

```bash
# Format
poetry run black src/ examples/

# Lint
poetry run ruff check src/ examples/

# Type check
poetry run mypy src/
```

## Architecture

```
┌─────────────────┐         ┌─────────────────────┐
│  Your App       │         │  mcp-client-service │
│                 │   WS    │                     │
│  MCPChatClient ◄──────────►  WebSocket Server   │
│                 │         │                     │
│  - callbacks    │         │  - Sessions         │
│  - send_message │         │  - Agent Runner     │
│  - consent      │         │  - Tool Execution   │
└─────────────────┘         └─────────────────────┘
```

## Troubleshooting

### "Connection failed" on connect

1. Verify the `mcp-client-service` is running
2. Check the URL is correct (ws:// or wss://)
3. Verify the `deployment_name` exists

### No events received

1. Ensure callbacks are registered before `connect()`
2. Check for errors with `on_error()` callback
3. Verify the session initialized with `on_connected()` callback

### Tool consent not working

1. Ensure `on_tool_consent_request()` callback is registered
2. Use `asyncio.create_task()` for async consent handlers
3. Call `respond_consent()` within the timeout period

## License

MIT
