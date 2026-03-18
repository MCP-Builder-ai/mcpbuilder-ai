# Python MCP Integration Examples

This directory contains examples demonstrating how to integrate the MCPBuilder Python SDK
into your Python applications.

## Examples

### [simple-python-cli](./simple-python-cli/)

A simple terminal-based chat client showing how to:
- Install the SDK from PyPI
- Configure connection settings with project token and deployment name
- Stream AI responses with real-time token output
- Handle tool executions with auto-consent
- Build an interactive CLI chat loop

## Prerequisites

- Python 3.10 or higher
- A project on [MCP-Builder.ai](https://mcp-builder.ai/) with a valid project token and deployment name
- See the [Getting Started guide](../mcp-usecase/README.md) to set up your MCP project

## Quick Start

1. Navigate to the example directory:
   ```bash
   cd simple-python-cli
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Update `main.py` with your credentials:
   - Set `project_token` to your MCPBuilder project token
   - Set `deployment_name` to your MCPBuilder deployment name

5. Run the example:
   ```bash
   python main.py
   ```

## Installing the SDK

```bash
pip install mcpbuilder-ai==1.0.1
```

## SDK Documentation

For complete SDK documentation, see the [MCPBuilder Python SDK README](../../python-sdk/README.md).
