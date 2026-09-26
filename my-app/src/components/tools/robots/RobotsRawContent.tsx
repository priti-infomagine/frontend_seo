import React, { useState } from 'react';

interface RobotsRawContentProps {
  rawContent?: string | null;
  reportMarkdown?: string | null;
}

export const RobotsRawContent: React.FC<RobotsRawContentProps> = ({
  rawContent,
  reportMarkdown,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!rawContent) return;
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Raw robots.txt Content */}
      {rawContent ? (
        <details
          open
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <summary
            style={{
              padding: '14px 18px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              userSelect: 'none',
              background: 'rgba(15, 23, 42, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📄 Raw robots.txt Content</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleCopy();
              }}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: copied ? '#4ade80' : 'var(--text)',
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </summary>
          <pre
            style={{
              margin: 0,
              padding: '16px 20px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#070d18',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {rawContent}
          </pre>
        </details>
      ) : null}

      {/* Optional Markdown Report if provided by backend */}
      {reportMarkdown ? (
        <details
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <summary
            style={{
              padding: '14px 18px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              userSelect: 'none',
              background: 'rgba(15, 23, 42, 0.4)',
            }}
          >
            <span>📝 Diagnostic Report Notes</span>
          </summary>
          <div
            style={{
              padding: '16px 20px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              whiteSpace: 'pre-wrap',
              background: '#070d18',
            }}
          >
            {reportMarkdown}
          </div>
        </details>
      ) : null}
    </div>
  );
};
