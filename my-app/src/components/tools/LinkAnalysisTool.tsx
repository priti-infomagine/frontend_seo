import { useState, useCallback, useEffect } from 'react';
import { ToolInputForm, ToolInputWrapper } from './ToolCard';

const LINK_COLOR = '#ec4899'; // Pink/magenta - distinct from primary color
const LINK_COLOR_BG = 'rgba(236, 72, 151, 0.1)';

interface LinkAnalysisResponse {
  check_id: string;
  task_id: string;
  url: string;
  domain: string;
  status: string;
  created_at: string;
}

interface LinkAnalysisStatusResponse {
  check_id: string;
  url: string;
  domain: string;
  status: string;
  phase: string;
  message: string;
  progress_percent: number;
  started_at: string;
  completed_at: string | null;
  error: string | null;
}

interface LinkAnalysisResult {
  check_id: string;
  url: string;
  domain: string;
  status: string;
  checked_at: string;
  stats: {
    total_pages: number;
    internal_links: number;
    external_links: number;
    broken_internal: number;
    broken_external: number;
    redirects: number;
    total_links: number;
  };
  internal_links: LinkResult[];
  external_links: LinkResult[];
  broken_links: BrokenLinkResult[];
  redirect_chains: RedirectChainResult[];
  orphan_pages: string[];
  recommendations: LinkRecommendation[];
  cost_seconds: number;
}

interface LinkResult {
  source_url: string;
  target_url: string;
  anchor_text: string;
  status_code: number | null;
  content_type: string | null;
  response_time_ms: number | null;
  is_internal: boolean;
  is_broken: boolean;
}

interface BrokenLinkResult {
  source_url: string;
  target_url: string;
  anchor_text: string;
  status_code: number | null;
  error: string | null;
}

interface RedirectChainResult {
  url: string;
  chain: RedirectStep[];
  total_redirects: number;
}

interface RedirectStep {
  url: string;
  status_code: number;
  final: boolean;
}

interface LinkRecommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affected_count: number;
}

function normalizeUrl(input: string): string {
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
}

function getPriorityColor(priority: string): string {
  const p = priority.toLowerCase();
  if (p === 'high') return 'var(--danger)';
  if (p === 'medium') return '#fbbf24';
  if (p === 'low') return '#3b82f6';
  return 'var(--text-muted)';
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function LinkStatsCard({ label, value, color = LINK_COLOR }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{ padding: '16px 20px', background: 'var(--card-bg)', border: `1px solid ${color}20`, borderRadius: '10px', textAlign: 'center', minWidth: '120px', flex: 1 }}>
      <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function ProgressBar({ phase, message, percent }: { phase: string; message: string; percent: number }) {
  const phaseLabels: Record<string, string> = {
    discovering: 'Discovering links...',
    crawling: 'Crawling pages...',
    analyzing: 'Analyzing links...',
    completed: 'Completed',
  };

  const label = phaseLabels[phase] || message || 'Processing...';

  return (
    <div style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{percent}%</span>
      </div>
      <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: percent > 0 
              ? `linear-gradient(90deg, ${LINK_COLOR}, #f4319a)` 
              : `repeating-linear-gradient(45deg, ${LINK_COLOR}, ${LINK_COLOR} 8px, #c2185b 8px, #c2185b 16px)`,
            backgroundSize: percent > 0 ? 'auto' : '20px 20px',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
            animation: percent === 0 ? 'progressShimmer 1.5s infinite linear' : 'none',
          }}
        />
      </div>
      {message && <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{message}</p>}
    </div>
  );
}

function BrokenLinksTable({ brokenLinks }: { brokenLinks: BrokenLinkResult[] }) {
  if (!brokenLinks.length) return null;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
          Broken Links ({brokenLinks.length})
        </h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Link URL</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Anchor Text</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {brokenLinks.map((link, i) => (
              <tr key={`${link.source_url}-${link.target_url}-${i}`} style={{ borderBottom: i < brokenLinks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                  <a href={link.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all', display: 'block', fontSize: '12px' }} title={link.source_url}>
                    {link.source_url || '-'}
                  </a>
                </td>
                <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                  <a href={link.target_url} target="_blank" rel="noopener noreferrer" style={{ color: '#fca5a5', textDecoration: 'none', wordBreak: 'break-all', display: 'block', fontSize: '12px' }} title={link.target_url}>
                    {link.target_url}
                  </a>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>{link.anchor_text}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--danger)' }}>{link.status_code || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#fca5a5', fontSize: '12px' }}>{link.error || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RedirectChainsTable({ chains }: { chains: RedirectChainResult[] }) {
  if (!chains.length) return null;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
          Redirect Chains ({chains.length})
        </h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Original URL</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Redirect Chain</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hops</th>
            </tr>
          </thead>
          <tbody>
            {chains.map((chain, i) => (
              <tr key={chain.url} style={{ borderBottom: i < chains.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px', maxWidth: '250px' }}>
                  <a href={chain.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all', fontSize: '12px' }} title={chain.url}>
                    {chain.url}
                  </a>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {chain.chain.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{step.status_code} →</span>
                        <a href={step.url} target="_blank" rel="noopener noreferrer" style={{ color: step.final ? LINK_COLOR : 'var(--text-muted)', textDecoration: 'none', wordBreak: 'break-all' }} title={step.url}>
                          {step.url}
                        </a>
                        {step.final && <span style={{ fontSize: '10px', color: LINK_COLOR, fontWeight: '600' }}>(final)</span>}
                      </div>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text)' }}>{chain.total_redirects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecommendationsList({ recommendations }: { recommendations: LinkRecommendation[] }) {
  if (!recommendations.length) return null;

  const sorted = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
          Recommendations ({recommendations.length})
        </h3>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map((rec, i) => (
          <div key={rec.type || i} style={{ padding: '14px', border: `1px solid ${getPriorityColor(rec.priority)}30`, borderRadius: '10px', background: `${getPriorityColor(rec.priority)}08` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{rec.title}</h4>
              <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: `${getPriorityColor(rec.priority)}15`, color: getPriorityColor(rec.priority) }}>
                {rec.priority}
              </span>
              {rec.affected_count > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {formatNumber(rec.affected_count)} affected
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{rec.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkAnalysisResults({ result }: { result: LinkAnalysisResult }) {
  const { stats, domain } = result;

  return (
    <>
      <div style={{ padding: '20px', background: LINK_COLOR_BG, border: `1px solid ${LINK_COLOR}40`, borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: LINK_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: '700' }}>
            ✓
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: LINK_COLOR }}>Analysis Complete</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Domain: {domain}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Checked: {new Date(result.checked_at).toLocaleString()}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration: {result.cost_seconds.toFixed(2)}s</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <LinkStatsCard label="Total Pages" value={formatNumber(stats.total_pages)} />
          <LinkStatsCard label="Total Links" value={formatNumber(stats.total_links)} />
          <LinkStatsCard label="Internal" value={formatNumber(stats.internal_links)} />
          <LinkStatsCard label="External" value={formatNumber(stats.external_links)} />
          <LinkStatsCard label="Broken Internal" value={formatNumber(stats.broken_internal)} color="var(--danger)" />
          <LinkStatsCard label="Broken External" value={formatNumber(stats.broken_external)} color="var(--danger)" />
          <LinkStatsCard label="Redirects" value={formatNumber(stats.redirects)} color="#fbbf24" />
        </div>
      </div>

      <BrokenLinksTable brokenLinks={result.broken_links} />
      <RedirectChainsTable chains={result.redirect_chains} />
      <RecommendationsList recommendations={result.recommendations} />

      {result.orphan_pages.length > 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
              Potential Orphan Pages ({result.orphan_pages.length})
            </h3>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.orphan_pages.map((page, i) => (
              <a key={i} href={page} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: LINK_COLOR, textDecoration: 'none', wordBreak: 'break-all', padding: '6px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px' }} title={page}>
                {page}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
        >
          Run New Analysis
        </button>
      </div>
    </>
  );
}

export function LinkAnalysisTool({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState<string>('');

  // Polling state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [checkId, setCheckId] = useState<string | null>(null);
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ phase: string; message: string; percent: number } | null>(null);

  const startCheck = useCallback(async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setCheckId(null);
    setProgress(null);

    try {
      const maxPagesNum = maxPages ? parseInt(maxPages, 10) : undefined;
      const res = await fetch('/api/v1/link-analysis/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized, max_pages: maxPagesNum }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: LinkAnalysisResponse = await res.json();
      setCheckId(data.check_id);
      setIsSubmitting(false);
      setIsPolling(true);
      setProgress({ phase: 'discovering', message: 'Starting analysis...', percent: 0 });
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to start link analysis');
    }
  }, [url, maxPages]);

  const pollStatus = useCallback(async (cid: string) => {
    if (!cid) return;

    try {
      const res = await fetch(`/api/v1/link-analysis/status/${cid}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: LinkAnalysisStatusResponse = await res.json();
      setProgress({ phase: data.phase, message: data.message, percent: data.progress_percent });

      if (data.status === 'completed') {
        setIsPolling(false);
        await fetchResult(cid);
      } else if (data.status === 'failed') {
        setIsPolling(false);
        setError(data.error || 'Link analysis failed');
      }
    } catch (err) {
      setIsPolling(false);
      setError(err instanceof Error ? err.message : 'Failed to poll status');
    }
  }, []);

  const fetchResult = useCallback(async (cid: string) => {
    try {
      const res = await fetch(`/api/v1/link-analysis/result/${cid}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data: LinkAnalysisResult = await res.json();
      setResult(data);
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    }
  }, []);

  // Polling effect
  useEffect(() => {
    if (!isPolling || !checkId) return;

    const interval = setInterval(() => {
      pollStatus(checkId);
    }, 2500);

    pollStatus(checkId);
    return () => clearInterval(interval);
  }, [isPolling, checkId, pollStatus]);

  return (
    <ToolInputWrapper
      title="Link Analysis"
      desc="Analyze internal and external links, detect broken links, and identify redirect chains on any website."
      onBack={onBack}
    >
      <ToolInputForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={startCheck}
        isLoading={isSubmitting || isPolling}
        submitLabel={isPolling ? 'Analyzing...' : isSubmitting ? 'Starting...' : 'Analyze Links'}
        inputPlaceholder="https://example.com"
        extraFields={
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Max Pages (optional)
            </label>
            <input
              type="number"
              value={maxPages}
              onChange={(e) => setMaxPages(e.target.value)}
              min="1"
              max="1000"
              disabled={isSubmitting || isPolling}
              placeholder="10"
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                fontFamily: 'inherit',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: '#0b1220',
                color: 'var(--text)',
                outline: 'none',
                width: '120px',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = LINK_COLOR;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>
        }
      />

      {error && (
        <div
          style={{
            marginTop: '16px',
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

      {(isPolling || isSubmitting) && progress && (
        <ProgressBar phase={progress.phase} message={progress.message} percent={progress.percent} />
      )}

      {result && (
        <LinkAnalysisResults result={result} />
      )}
    </ToolInputWrapper>
  );
}