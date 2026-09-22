import { useState } from 'react';
import { ToolInputForm, ToolInputWrapper } from './ToolCard';

export function SitemapTool({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
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

  const parseSitemap = (xml: string): string[] => {
    const matches = xml.match(/<loc[^>]*>([^<]+)<\/loc>/gi);
    if (!matches) return [];
    return matches
      .map((m) => {
        const inner = m.replace(/<loc[^>]*>/i, '').replace(/<\/loc>/i, '').trim();
        return inner;
      })
      .filter(Boolean);
  };

  const handleFetch = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    setIsLoading(true);
    setError(null);
    setContent(null);
    setUrls([]);

    try {
      const res = await fetch(`${normalized}/sitemap.xml`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      }
      const text = await res.text();
      setContent(text);
      setUrls(parseSitemap(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sitemap.xml');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolInputWrapper
      title="Sitemap Inspector"
      desc="Fetch and parse sitemap.xml to discover all indexed URLs."
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

      {urls.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <StatCard label="Total URLs" value={urls.length} color="var(--primary)" />
          </div>

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
              Sitemap URLs ({urls.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {urls.map((pageUrl, i) => (
                <a
                  key={i}
                  href={pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '13px',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    padding: '4px 0',
                    display: 'block',
                    wordBreak: 'break-all',
                  }}
                  title={pageUrl}
                >
                  {pageUrl}
                </a>
              ))}
            </div>
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
            Raw XML
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        textAlign: 'center',
        minWidth: '120px',
        flex: 1,
      }}
    >
      <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}
