# Roast My Claude Code Session

```
  ____                 _   
 |  _ \ ___   __ _ ___| |_ 
 | |_) / _ \ / _` / __| __|
 |  _ < (_) | (_| \__ \ |_ 
 |_| \_\___/ \__,_|___/\__|
```

> **Get your Claude Code conversation roasted by AI. Add the MCP server, say the magic words, and receive brutal — but fair — feedback on how you (mis)used Claude.**

---

## How to Roast Your Claude Code Session

### Step 1 — Add the MCP server to Claude

```bash
claude mcp add --transport http Roast_My_Claude_Session https://dixawoxlywxy.eu.cloud.mcp-builder.ai/mcp
```

This registers the MCP server globally in your Claude Code config. You only need to do this once.

### Step 2 — Ask Claude to roast your session

Open any Claude Code session and asked to roast your session:

```
Roast this Session for me.
```

Claude will:
1. Send all messages in your session to the MCP-Server roast tool.
2. The MCP-Server uses GPT-4o-mini to roast your session

---

### Step 3 — (Optional) Publish the Roast and share it with your friends. 

If you like to share your roast simple ask and it will return a public shareable link.

```
Publish my roast and return a link.
```

## Privacy & Data Notice

> [!WARNING]
> **Your session messages are sent to OpenAI for processing.**
> Do not roast sessions that contain passwords, API keys, personal data, or any other sensitive information.

- Your **conversation messages** are forwarded to OpenAI (GPT-4o-mini) once to generate the roast — they are not stored by this service.
- Only the **roast result** (scores + comments) is stored in our database, tied to a random hash.
- No raw messages are ever persisted.

**Techstack:**

| Layer | Built with |
|---|---|
| MCP Server | [MCP-Builder.ai](https://mcp-builder.ai/) — no infra, just YAML tool definitions |
| Frontend | [Lovable](https://lovable.dev/) — deployed at `https://roast-my-claude-code-session.lovable.app` |
| Storage | Supabase — roasts stored with a unique hash and fetched by the frontend |
| Roast engine | OpenAI GPT-4o-mini |

---

## The MCP-Builder.ai Config

The MCP server was built using MCP-Buidler.ai and is defined entirely in two YAML files inside `mcp-builder-ai-config/`. No server code, no deployment scripts — just declarative tool definitions uploaded to [MCP-Builder.ai](https://mcp-builder.ai/).

### `tool-roast-session.yaml`

Receives the raw Claude Code session content, sends it to OpenAI, and returns a structured roast.

**What it does:** Takes the session body Claude passes in, calls GPT-4o-mini with a system prompt that instructs it to be a harsh-but-funny code session critic, and returns the structured roast (text + dimension scores).

---

### `tool-publish-roast.yaml`

Receives the structured roast scores from Claude, persists them to Supabase, and returns a unique shareable link.

**What it does:** Generates a random hash, inserts all roast fields into a Supabase table, and returns a link in the format `https://example.com/{hash}` that the frontend uses to display the results.

---