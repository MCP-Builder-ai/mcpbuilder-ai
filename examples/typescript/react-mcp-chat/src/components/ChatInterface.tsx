import { useState, useEffect, useRef, useCallback } from 'react';
import { MCPChatClient } from 'mcpbuilder-ai';
import type { ChatConfig } from '../App';
import { MessageList, type Message } from './MessageList';
import { ToolConsentModal, type ConsentRequest } from './ToolConsentModal';

interface ChatInterfaceProps {
  config: ChatConfig;
}

export function ChatInterface({ config }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentRequest, setConsentRequest] = useState<ConsentRequest | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  
  const clientRef = useRef<MCPChatClient | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceIdRef = useRef(Math.random().toString(36).slice(2, 8));

  // Initialize and connect the client
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    console.log(`[${instanceId}] ChatInterface useEffect mounting`);
    
    // Track if this effect instance is still active (not cleaned up)
    let isCancelled = false;
    
    const client = new MCPChatClient({
      projectToken: config.projectToken,
      deploymentName: config.deploymentName,
      mcpClientUrl: config.mcpClientUrl,
      cacheHistory: true,
      autoReconnect: false, // Disable auto-reconnect to prevent loops during dev HMR
    });

    // Register callbacks - only apply state changes if not cancelled
    client
      .onConnected((sessionId) => {
        console.log(`[${instanceId}] onConnected, cancelled=${isCancelled}, session=${sessionId}`);
        if (isCancelled) return;
        setIsConnected(true);
        setError(null);
        addSystemMessage(`Connected to ${config.deploymentName}`);
      })
      .onToken((token) => {
        if (isCancelled) return;
        setStreamingContent((prev) => prev + token);
      })
      .onToolStart((name, input) => {
        if (isCancelled) return;
        addSystemMessage(`🔧 Calling tool: ${name}`, { tool: name, input });
      })
      .onToolEnd((name, output, success, error) => {
        if (isCancelled) return;
        if (success) {
          addSystemMessage(`✓ ${name} completed`, { tool: name, output });
        } else {
          addSystemMessage(`✗ ${name} failed: ${error}`, { tool: name, error });
        }
      })
      .onToolConsentRequest((consentId, tool, args, description) => {
        if (isCancelled) return;
        setConsentRequest({ consentId, tool, args, description });
      })
      .onFinal((text) => {
        console.log(`[${instanceId}] onFinal, cancelled=${isCancelled}, text=${text.substring(0, 50)}...`);
        if (isCancelled) return;
        // Add the complete assistant message
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: text, timestamp: new Date() },
        ]);
        setStreamingContent('');
        setIsLoading(false);
      })
      .onError((msg) => {
        if (isCancelled) return;
        setError(msg);
        setIsLoading(false);
        addSystemMessage(`❌ Error: ${msg}`);
      })
      .onDisconnected((reason) => {
        if (isCancelled) return;
        setIsConnected(false);
        addSystemMessage(`Disconnected: ${reason || 'Unknown reason'}`);
      });

    // Connect
    client.connect().catch((err) => {
      if (isCancelled) return;
      setError(`Connection failed: ${err.message}`);
    });

    clientRef.current = client;

    // Cleanup on unmount
    return () => {
      console.log(`[${instanceId}] ChatInterface useEffect cleanup, setting cancelled=true`);
      isCancelled = true;
      client.disconnect();
    };
  }, [config]);

  const addSystemMessage = useCallback((content: string, data?: Record<string, unknown>) => {
    setMessages((prev) => [
      ...prev,
      { role: 'system', content, timestamp: new Date(), data },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !clientRef.current || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ]);

    // Send message via SDK
    try {
      await clientRef.current.sendMessage(userMessage);
    } catch (err) {
      setError(`Failed to send message: ${err}`);
      setIsLoading(false);
    }
  };

  const handleConsent = async (allow: boolean, allowAll: boolean) => {
    if (!consentRequest || !clientRef.current) return;

    await clientRef.current.respondConsent(
      consentRequest.consentId,
      allow,
      allowAll
    );
    setConsentRequest(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <MessageList 
        messages={messages} 
        streamingContent={streamingContent}
        isLoading={isLoading}
      />

      <div className="chat-input-container">
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={!isConnected || isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || isLoading || !input.trim()}
            className="btn-send"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>

      {consentRequest && (
        <ToolConsentModal
          request={consentRequest}
          onRespond={handleConsent}
        />
      )}
    </div>
  );
}
