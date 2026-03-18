# Getting Started with MCP-Builder.ai

This guide walks you through creating a project on [MCP-Builder.ai](https://mcp-builder.ai/) so you can start using the SDK examples in this repository.

---

## 1. Create an Account

1. Go to [mcp-builder.ai](https://mcp-builder.ai/) and sign up for an account.
2. Log in to access the dashboard.

## 2. Create a New Project

1. From the dashboard, click **"Start Building for Free"** to create a new project.
2. Give your project a name (e.g., `my-first-mcp-server`).

## 3. Configure Your MCP Server

1. **Connect Datasources to Add Tools** — provide the OpenAPI spec, Database structure or manually configure the endpoints your tools will call.
2. **Set Up Authentication** — secure your Tools with how your MCP server authenticates with external APIs, Databases, etc.
3. **Customize the LLM** — optionally configure a system message, welcome message, choose a language, or adjust models.
4. **Set your project to public** - in order to use your project with a SDK, you need to set the project to public in the Client Settings.  

## 4. Deploy

1. The MCP server should deploy automatically. If not, configure it accordingly and click **"Start Server"** to publish your MCP server.
2. Your MCP server is now live and ready to accept connections.
3. Copy the **Deployment Name** and **Project Token** from the Integration tab for the respective coding language you use. You need to initialize the MCPChatClient with those parameters.

## 5. Connect with the SDK

Use the **Project Token** and **Deployment Name** from the steps above to connect from any of the example projects.

### Python

```bash
cd examples/python/simple-python-cli
pip install -r requirements.txt
```

Open `main.py` and set your credentials:

```python
client = MCPChatClient(
    project_token="<YOUR_PROJECT_TOKEN>",
    deployment_name="<YOUR_DEPLOYMENT_NAME>",
)
```

Run it:

```bash
python main.py
```

### TypeScript

```bash
cd examples/typescript/react-mcp-chat
npm install
```

Create a `.env` file:

```env
VITE_PROJECT_TOKEN=your-project-token
VITE_DEPLOYMENT_NAME=your-deployment-name
```

Run it:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Next Steps

- Explore the [Python CLI example](../python/simple-python-cli/) for a terminal-based chat client.
- Explore the [React Chat example](../typescript/react-mcp-chat/) for a browser-based chat UI.
- Read the [Python SDK docs](../../python-sdk/README.md) or [TypeScript SDK docs](../../typescript-sdk/README.md) for the full API reference.
