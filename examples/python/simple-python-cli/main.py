#!/usr/bin/env python3
"""
MCP Integration Demo - Simple Chat Example

Usage:
    1. Update the project_token and deployment_name below
    2. Run: python main.py
"""
import asyncio
from mcpbuilder import MCPChatClient

async def main():
    # =========================================================================
    # CONFIGURE YOUR MCP CLIENT HERE
    # Replace with your project_token and deployment_name from MCPBuilder
    # =========================================================================
    client = MCPChatClient(
        project_token="<PROJECT_TOKEN_GOES_HERE>",
        deployment_name="<DEPLOYMENT_NAME_GOES_HERE>",
        cache_history=True # <- to automatically cache the history in the mcp-client
    )

    # Track when response is complete
    response_done = asyncio.Event()

    # Register callbacks
    client \
        .on_connected(lambda sid: print(f"✅ Connected (session: {sid})")) \
        .on_token(lambda text: print(text, end="", flush=True)) \
        .on_tool_start(lambda name, args: print(f"\n🔧 Tool: {name}")) \
        .on_tool_end(lambda name, output, ok, err: print(f"   {'✓' if ok else '✗'} Done")) \
        .on_final(lambda text, tool_calls: response_done.set()) \
        .on_error(lambda msg: print(f"\n❌ Error: {msg}")) \
        .on_disconnected(lambda reason: print(f"\n🔌 Disconnected: {reason}"))

    # Connect
    print("🔗 Connecting...")
    await client.connect()

    # Auto-approve all tool executions
    await client.set_consent_all(enabled=True)

    print("\n" + "=" * 50)
    print("MCP Chat - Type 'quit' to exit")
    print("=" * 50 + "\n")

    # Chat loop
    while True:
        user_input = input("You: ").strip()

        if user_input.lower() == "quit":
            print("👋 Goodbye!")
            break

        if not user_input:
            continue

        response_done.clear()
        print("\nAssistant: ", end="", flush=True)

        await client.send_message(user_input)
        await asyncio.wait_for(response_done.wait(), timeout=120)
        print("\n")

    await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
