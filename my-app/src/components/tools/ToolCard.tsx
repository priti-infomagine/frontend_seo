import type { ReactNode } from 'react';

interface ToolCardProps {
  icon: string;
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
}

export function ToolCard({ icon, title, desc, color, onClick }: ToolCardProps) {
  return (
    <button
      type="button"
      className="tool-card"
      onClick={onClick}
      style={{
        border: `1px solid var(--border)`,
      }}
    >
      <div
        className="tool-icon"
        style={{
          background: `${color}15`,
          color: color,
        }}
      >
        {icon}
      </div>
      <div className="tool-title">{title}</div>
      <div className="tool-desc">{desc}</div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={{
          padding: '10px 20px',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: 'inherit',
          color: '#fff',
          background: 'var(--primary)',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          marginTop: 'auto',
        }}
      >
        Open Tool
      </button>
    </button>
  );
}

interface ToolInputWrapperProps {
  title: string;
  desc: string;
  onBack: () => void;
  children: ReactNode;
}

export function ToolInputWrapper({ title, desc, onBack, children }: ToolInputWrapperProps) {
  return (
    <div className="tools-page-wrapper">
      <button
        type="button"
        onClick={onBack}
        className="back-button"
        style={{ alignSelf: 'flex-start' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Tools
      </button>

      <div className="tools-section-header">
        <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{desc}</p>
      </div>

      {children}
    </div>
  );
}

interface ToolInputFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
  inputPlaceholder?: string;
  extraFields?: React.ReactNode;
}

export function ToolInputForm({
  url,
  onUrlChange,
  onSubmit,
  isLoading,
  submitLabel,
  inputPlaceholder = 'example.com',
  extraFields,
}: ToolInputFormProps) {
  const normalizeUrl = (input: string): string => {
    if (!input) return '';
    let value = input.trim();
    if (!/^https?:\/\//i.test(value)) {
      value = `https://${value}`;
    }
    try {
      const urlObj = new URL(value);
      urlObj.hostname = urlObj.hostname.toLowerCase();
      return urlObj.toString();
    } catch {
      return '';
    }
  };

  const normalized = normalizeUrl(url);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="tool-form-row">
        <input
          type="text"
          placeholder={inputPlaceholder}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '14px 16px',
            fontSize: '16px',
            fontFamily: 'inherit',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            background: '#0b1220',
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !url.trim() || !normalized}
          style={{
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: '600',
            fontFamily: 'inherit',
            color: '#fff',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: '10px',
            cursor: isLoading || !url.trim() || !normalized ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
            opacity: isLoading || !url.trim() || !normalized ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Running...' : submitLabel}
        </button>
      </div>

      {extraFields}

      {normalized && url && normalized !== url && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Will fetch: </span>
          <code
            style={{
              background: 'rgba(37, 99, 235, 0.15)',
              padding: '2px 8px',
              borderRadius: '4px',
              color: 'var(--primary)',
              fontSize: '13px',
              wordBreak: 'break-all',
            }}
          >
            {normalized}
          </code>
        </div>
      )}
    </div>
  );
}
