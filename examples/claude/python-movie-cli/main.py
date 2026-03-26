#!/usr/bin/env python
"""
CineGuide — terminal movie discovery assistant.

Requires:
    DEPLOYMENT_NAME  — your MCP deployment name
    PROJECT_TOKEN    — your project token
"""

import asyncio
import os
import sys

from dotenv import load_dotenv
from mcpbuilder import MCPChatClient

load_dotenv()

DEPLOYMENT_NAME = os.getenv("DEPLOYMENT_NAME", "")
PROJECT_TOKEN = os.getenv("PROJECT_TOKEN", "")
MCP_CLIENT_URL = os.getenv("MCP_CLIENT_URL")
TIMEZONE = os.getenv("TIMEZONE", "Europe/London")

BANNER = """
========================================
  CineGuide — Movie Discovery Assistant
  Data provided by TMDB — themoviedb.org
  Type 'quit' or 'exit' to leave.
========================================
"""


def check_env():
    missing = [k for k, v in {
        "DEPLOYMENT_NAME": DEPLOYMENT_NAME,
        "PROJECT_TOKEN": PROJECT_TOKEN,
    }.items() if not v]
    if missing:
        print(f"Error: missing required environment variables: {', '.join(missing)}")
        sys.exit(1)


async def main():
    check_env()

    response_complete = asyncio.Event()

    client = MCPChatClient(
        project_token=PROJECT_TOKEN,
        deployment_name=DEPLOYMENT_NAME,
        **({"mcp_client_url": MCP_CLIENT_URL} if MCP_CLIENT_URL else {}),
        auto_reconnect=True,
        max_reconnect_attempts=5,
        cache_history=True,
    )

    client \
        .on_connected(lambda sid: print(f"Connected (session: {sid})\n")) \
        .on_token(lambda text: print(text, end="", flush=True)) \
        .on_tool_start(lambda name, args: None) \
        .on_tool_end(lambda name, output, success, error: None) \
        .on_final(lambda text, tool_calls: response_complete.set()) \
        .on_error(lambda msg: print(f"\nError: {msg}")) \
        .on_disconnected(lambda reason: print(f"\nDisconnected: {reason}"))

    print("Connecting...")
    try:
        await client.connect(timezone=TIMEZONE)
        await client.set_consent_all(True)
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    print(BANNER)

    try:
        while True:
            try:
                user_input = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: input("🎬 > ")
                )
            except (EOFError, KeyboardInterrupt):
                print("\nGoodbye!")
                break

            user_input = user_input.strip()
            if not user_input:
                continue

            if user_input.lower() in ("quit", "exit"):
                print("Goodbye!")
                break

            print("CineGuide: ", end="", flush=True)
            response_complete.clear()

            try:
                await client.send_message(user_input)
                try:
                    await asyncio.wait_for(response_complete.wait(), timeout=120.0)
                except asyncio.TimeoutError:
                    print("\nResponse timed out.")
                print()
            except asyncio.CancelledError:
                print("\nCancelled.")
            except Exception as e:
                print(f"\nError: {e}")
    finally:
        await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
