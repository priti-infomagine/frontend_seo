import { useState } from 'react';
import type { StartAuditRequest } from '../types/audit';

interface InputScreenProps {
  onStartAudit: (request: StartAuditRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function InputScreen({ onStartAudit, isLoading, error }: InputScreenProps) {
  const [url, setUrl] = useState('');
  const [normalizedPreview, setNormalizedPreview] = useState('');
  const [concurrency, setConcurrency] = useState(5);
  const [fullPipeline, setFullPipeline] = useState(true);
  const [force, setForce] = useState(false);

  const normalizeUrl = (input: string) => {
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    const normalized = normalizeUrl(value);
    setNormalizedPreview(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    await onStartAudit({
      url: normalized,
      concurrency,
      full_pipeline: fullPipeline,
      force,
    });
  };

  return (
    <div className="input-screen">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-0.5px', marginBottom: '6px' }}>
          SEO Audit
        </h1>
        <p className="subtitle" style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
          Enter a website URL to start a comprehensive SEO crawl and analysis
        </p>
      </div>

      <form className="url-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'row', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="example.com"
            value={url}
            onChange={handleUrlChange}
            required
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
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim() || !normalizeUrl(url)}
            style={{
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: 'inherit',
              color: '#fff',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '10px',
              cursor: isLoading || !url.trim() || !normalizeUrl(url) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
              opacity: isLoading || !url.trim() || !normalizeUrl(url) ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Starting Audit...' : 'Start Audit'}
          </button>
        </div>

        {normalizedPreview && url && normalizedPreview !== url && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Will analyze:</span>
            <code style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '2px 8px', borderRadius: '4px', color: 'var(--primary)', fontSize: '13px' }}>
              {normalizedPreview}
            </code>
          </div>
        )}

        <details style={{ border: '1px solid var(--border)', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
          <summary style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Advanced Options
          </summary>
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Concurrency (parallel pages)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={concurrency}
                onChange={(e) => setConcurrency(Math.max(1, Math.min(50, Number(e.target.value))))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  background: '#0b1220',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                How many pages to crawl simultaneously (default: 5)
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={fullPipeline}
                  onChange={(e) => setFullPipeline(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>Full pipeline (all 64 checks)</span>
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '26px' }}>
                Run complete crawl + all rule checks. Uncheck for faster, lighter analysis.
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={force}
                  onChange={(e) => setForce(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>Force fresh crawl</span>
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '26px' }}>
                Ignore any cached results and force a new crawl.
              </div>
            </div>
          </div>
        </details>

        {error && (
          <div
            className="status status-error"
            style={{
              color: '#fca5a5',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span>❌</span>
              <strong>Request Failed</strong>
            </div>
            <div>{error}</div>
          </div>
        )}
      </form>
      </div>
    </div>
  );
}