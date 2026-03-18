import { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { ConfigForm } from './components/ConfigForm';

export interface ChatConfig {
  projectToken: string;
  deploymentName: string;
  mcpClientUrl?: string;
}

function App() {
  const [config, setConfig] = useState<ChatConfig | null>(null);

  if (!config) {
    return <ConfigForm onSubmit={setConfig} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>MCPBuilder Chat</h1>
        <button 
          className="btn-secondary"
          onClick={() => setConfig(null)}
        >
          Change Config
        </button>
      </header>
      <ChatInterface config={config} />
    </div>
  );
}

export default App;
