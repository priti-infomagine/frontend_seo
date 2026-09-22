import { useState } from 'react';
import { ToolInputForm, ToolInputWrapper } from './ToolCard';

export function RobotsTxtTool({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Array<{ type: string; value: string }>>([]);
  const [error, setError] = useState<string | null>(null);

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

  const parseRobotsTxt = (text: string): Array<{ type: string; value: string }> => {
    const lines = text.split('\n');
    const result: Array<{ type: string; value: string }> = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const type = trimmed.substring(0, colonIndex).trim().toLowerCase();
        const value = trimmed.substring(colonIndex + 1).trim();
        result.push({ type, value });
      }
    }
    return result;
  };

  const handleFetch = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    setIsLoading(true);
    setError(null);
    setContent(null);
    setParsed([]);

    try {
      const res = await fetch(`${normalized}/robots.txt`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      }
      const text = await res.text();
      setContent(text);
      setParsed(parseRobotsTxt(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch robots.txt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolInputWrapper
      title="robots.txt Inspector"
      desc="Fetch and inspect robots.txt to understand crawling rules and disallowed paths."
      onBack={onBack}
    >
      <ToolInputForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleFetch}
        isLoading={isLoading}
        submitLabel="Fetch"
        inputPlaceholder="example.com"
      />

      {error && (
        <div
          style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {parsed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              overflow: 'auto',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>
              Parsed Rules ({parsed.length})
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: '500' }}>Directive</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: '500' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((rule, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < parsed.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '8px 12px', color: 'var(--primary)', fontWeight: '500', fontFamily: 'monospace' }}>
                      {rule.type}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', wordBreak: 'break-all' }}>
                      {rule.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {content && (
        <details style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <summary
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              userSelect: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Raw robots.txt
          </summary>
          <pre
            style={{
              margin: 0,
              padding: '16px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            {content}
          </pre>
        </details>
      )}
    </ToolInputWrapper>
  );
}