import { useEffect, useRef } from 'react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isLoading: boolean;
}

export function MessageList({ messages, streamingContent, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="message-list">
      {messages.length === 0 && !streamingContent && (
        <div className="empty-state">
          <p>👋 Welcome! Start a conversation by typing a message below.</p>
        </div>
      )}

      {messages.map((msg, index) => (
        <div key={index} className={`message message-${msg.role}`}>
          <div className="message-header">
            <span className="message-role">
              {msg.role === 'user' ? '👤 You' : msg.role === 'assistant' ? '🤖 Assistant' : 'ℹ️ System'}
            </span>
            <span className="message-time">
              {msg.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div className="message-content">
            {msg.content}
          </div>
          {msg.data && (
            <details className="message-data">
              <summary>Details</summary>
              <pre>{JSON.stringify(msg.data, null, 2)}</pre>
            </details>
          )}
        </div>
      ))}

      {/* Streaming content (assistant is typing) */}
      {streamingContent && (
        <div className="message message-assistant streaming">
          <div className="message-header">
            <span className="message-role">🤖 Assistant</span>
            <span className="typing-indicator">typing...</span>
          </div>
          <div className="message-content">
            {streamingContent}
            <span className="cursor">▌</span>
          </div>
        </div>
      )}

      {/* Loading indicator when waiting for response */}
      {isLoading && !streamingContent && (
        <div className="message message-assistant loading">
          <div className="message-content">
            <span className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
