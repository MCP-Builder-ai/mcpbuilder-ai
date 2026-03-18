import { useState } from 'react';
import type { ChatConfig } from '../App';

interface ConfigFormProps {
  onSubmit: (config: ChatConfig) => void;
}

export function ConfigForm({ onSubmit }: ConfigFormProps) {
  const [projectToken, setProjectToken] = useState(
    import.meta.env.VITE_PROJECT_TOKEN || ''
  );
  const [deploymentName, setDeploymentName] = useState(
    import.meta.env.VITE_DEPLOYMENT_NAME || ''
  );
  const [mcpClientUrl, setMcpClientUrl] = useState(
    import.meta.env.VITE_MCP_CLIENT_URL || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      projectToken,
      deploymentName,
      mcpClientUrl: mcpClientUrl || undefined,
    });
  };

  return (
    <div className="config-form-container">
      <div className="config-form">
        <h1>MCPBuilder Chat</h1>
        <p className="subtitle">Configure your connection settings</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="projectToken">Project Token *</label>
            <input
              id="projectToken"
              type="password"
              value={projectToken}
              onChange={(e) => setProjectToken(e.target.value)}
              placeholder="Enter your project token"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="deploymentName">Deployment Name *</label>
            <input
              id="deploymentName"
              type="text"
              value={deploymentName}
              onChange={(e) => setDeploymentName(e.target.value)}
              placeholder="e.g., my-chatbot"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mcpClientUrl">
              MCP Client URL <span className="optional">(optional)</span>
            </label>
            <input
              id="mcpClientUrl"
              type="url"
              value={mcpClientUrl}
              onChange={(e) => setMcpClientUrl(e.target.value)}
              placeholder="Default: https://mcp-client.apichap.com"
            />
            <small>Only needed for on-premise deployments</small>
          </div>

          <button type="submit" className="btn-primary">
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}
