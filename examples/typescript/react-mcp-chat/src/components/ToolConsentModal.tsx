export interface ConsentRequest {
  consentId: string;
  tool: string;
  args: Record<string, unknown>;
  description?: string;
}

interface ToolConsentModalProps {
  request: ConsentRequest;
  onRespond: (allow: boolean, allowAll: boolean) => void;
}

export function ToolConsentModal({ request, onRespond }: ToolConsentModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>⚠️ Tool Consent Required</h2>
        
        <div className="consent-details">
          <div className="consent-tool">
            <strong>Tool:</strong> {request.tool}
          </div>
          
          {request.description && (
            <div className="consent-description">
              <strong>Description:</strong> {request.description}
            </div>
          )}
          
          <div className="consent-args">
            <strong>Arguments:</strong>
            <pre>{JSON.stringify(request.args, null, 2)}</pre>
          </div>
        </div>

        <p className="consent-question">
          Do you want to allow this tool to execute?
        </p>

        <div className="consent-actions">
          <button 
            className="btn-danger"
            onClick={() => onRespond(false, false)}
          >
            Deny
          </button>
          <button 
            className="btn-primary"
            onClick={() => onRespond(true, false)}
          >
            Allow Once
          </button>
          <button 
            className="btn-secondary"
            onClick={() => onRespond(true, true)}
          >
            Always Allow
          </button>
        </div>
      </div>
    </div>
  );
}
