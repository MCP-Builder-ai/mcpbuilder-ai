/**
 * ChefBot — recipe discovery web server.
 *
 * Serves a web UI and streams MCP agent responses to the browser via SSE.
 *
 * Requires:
 *   DEPLOYMENT_NAME  — your MCP deployment name
 *   PROJECT_TOKEN    — your project token
 *   MCP_CLIENT_URL   — MCP client service URL (optional, defaults to cloud)
 *   PORT             — HTTP port (default: 3000)
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { MCPChatClient } from 'mcpbuilder-ai';

config();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEPLOYMENT_NAME = process.env.DEPLOYMENT_NAME ?? '';
const PROJECT_TOKEN   = process.env.PROJECT_TOKEN ?? '';
const MCP_CLIENT_URL  = process.env.MCP_CLIENT_URL ?? '';
const TIMEZONE        = process.env.TIMEZONE ?? 'Europe/London';
const PORT            = parseInt(process.env.PORT ?? '3000', 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function checkEnv(): void {
  const missing = ['DEPLOYMENT_NAME', 'PROJECT_TOKEN'].filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`Error: missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// MCP client
// ---------------------------------------------------------------------------

type SendFn = (event: string, data: unknown) => void;

let activeSend: SendFn | null = null;

const client = new MCPChatClient({
  projectToken:         PROJECT_TOKEN,
  deploymentName:       DEPLOYMENT_NAME,
  ...(MCP_CLIENT_URL ? { mcpClientUrl: MCP_CLIENT_URL } : {}),
  autoReconnect:        true,
  maxReconnectAttempts: 5,
  cacheHistory:         true,
});

function sendEvent(event: string, data: unknown): void {
  activeSend?.(event, data);
}

client
  .onConnected(sid  => console.log(`MCP connected (session: ${sid})`))
  .onToken(text     => sendEvent('token',      { text }))
  .onToolStart(name => sendEvent('tool_start', { name }))
  .onToolEnd((name, _out, success, error) => {
    sendEvent('tool_end', { name, success, error: error ?? null });
  })
  .onFinal((text, toolCalls) => {
    sendEvent('final', { text, toolCalls });
    activeSend = null;
  })
  .onError(message => {
    sendEvent('error', { message });
    activeSend = null;
  })
  .onDisconnected(reason => {
    if (reason) console.log(`MCP disconnected: ${reason}`);
  });

// ---------------------------------------------------------------------------
// Express
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, connected: client.isConnected });
});

app.post('/api/chat', async (req, res) => {
  const message: string = (req.body?.message ?? '').trim();

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  if (activeSend) {
    res.status(429).json({ error: 'A response is already in progress — please wait.' });
    return;
  }

  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  const write = (event: string, data: unknown): void => {
    if (res.destroyed || res.writableEnded) {
      activeSend = null;
      return;
    }
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (event === 'final' || event === 'error') res.end();
  };

  activeSend = write;

  try {
    await client.sendMessage(message);
  } catch (err) {
    write('error', { message: String(err) });
    activeSend = null;
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function start(): Promise<void> {
  checkEnv();

  console.log('Connecting to MCP service...');
  try {
    await client.connect({ timezone: TIMEZONE });
    await client.setConsentAll(true);
  } catch (err) {
    console.error(`Failed to connect: ${err}`);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`ChefBot running at http://localhost:${PORT}`);
  });
}

start();
