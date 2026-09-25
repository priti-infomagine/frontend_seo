import { useState, useEffect, useCallback } from 'react';
import { ToolInputForm, ToolInputWrapper } from './ToolCard';

const DEVICE_OPTIONS = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'performance', label: 'Performance' },
  { value: 'seo', label: 'SEO' },
  { value: 'best-practices', label: 'Best Practices' },
  { value: 'accessibility', label: 'Accessibility' },
] as const;

const VERSION_OPTIONS = [
  { value: 'v11', label: 'Lighthouse v11' },
  { value: 'v10', label: 'Lighthouse v10' },
  { value: 'v9', label: 'Lighthouse v9' },
] as const;

type Device = typeof DEVICE_OPTIONS[number]['value'];
type Category = typeof CATEGORY_OPTIONS[number]['value'];
type Version = typeof VERSION_OPTIONS[number]['value'];

interface CheckResponse {
  success: boolean;
  status: string;
  message: string;
  check_id: string;
  task_id: string;
  url: string;
  domain: string;
  device: string;
  categories: string[];
  status_url: string;
  result_url: string;
}

interface StatusResponse {
  check_id: string;
  task_id: string;
  status: string;
  phase: string;
  domain: string;
  device: string;
  categories: string[];
  pages_discovered: number;
  pages_crawled: number;
  pagespeed_total: number;
  pagespeed_checked: number;
  pagespeed_succeeded: number;
  pagespeed_failed: number;
  progress_percent: number;
  started_at: string;
  completed_at: string | null;
  duration_ms: number;
  error: string | null;
  result_url: string;
}

// Backend response from /results/{check_id}
interface BackendResultItem {
  id: string;
  url: string;
  device: string;
  status: string;
  reason: string | null;
  performance_score: number | null;
  seo_score: number | null;
  fcp_ms: number | null;
  lcp_ms: number | null;
  tbt_ms: number | null;
  cls: number | null;
  recommendations: Recommendation[];
}

interface ResultScores {
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  best_practices: number | null;
}

interface ResultMetrics {
  fcp_ms: number | null;
  lcp_ms: number | null;
  tbt_ms: number | null;
  cls: number | null;
  speed_index_ms: number | null;
}

interface Recommendation {
  // Core PageSpeed Insights / Lighthouse audit fields
  audit_id: string;
  category: string;
  category_weight: number;
  title: string;
  score: number;
  score_display_mode: string;
  display_value: string | null;
  numeric_value: number | null;
  numeric_unit: string | null;
  description: string;
  explanation: string | null;
  details_type: string | null;
  estimated_savings_ms: number | null;
  estimated_savings_bytes: number | null;
  warnings: unknown[];
  error_message: string | null;
  evidence: Array<{ url: string }>;
  where_to_fix: string;
  recommendation: string;
  // Allow any additional fields
  [key: string]: unknown;
}

interface ResultItem {
  id: string;
  url: string;
  device: string;
  status: string;
  reason: string | null;
  scores: ResultScores;
  metrics: ResultMetrics;
  recommendations: Recommendation[];
}

const getScoreColor = (score: number | null): string => {
  if (score === null) return 'var(--text-muted)';
  if (score >= 90) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
};

const getMetricColor = (metric: string, value: number | null): string => {
  if (value === null) return 'var(--text-muted)';
  switch (metric) {
    case 'fcp':
      if (value <= 1800) return '#22c55e';
      if (value <= 3000) return '#eab308';
      return '#ef4444';
    case 'lcp':
      if (value <= 2500) return '#22c55e';
      if (value <= 4000) return '#eab308';
      return '#ef4444';
    case 'tbt':
      if (value <= 200) return '#22c55e';
      if (value <= 600) return '#eab308';
      return '#ef4444';
    case 'cls':
      if (value <= 0.1) return '#22c55e';
      if (value <= 0.25) return '#eab308';
      return '#ef4444';
    case 'speed_index':
      if (value <= 3400) return '#22c55e';
      if (value <= 5800) return '#eab308';
      return '#ef4444';
    default:
      return 'var(--text-muted)';
  }
};

const formatMetricValue = (metric: string, value: number | null): string => {
  if (value === null) return '—';
  switch (metric) {
    case 'fcp':
    case 'lcp':
    case 'tbt':
    case 'speed_index':
      return `${value}ms`;
    case 'cls':
      return value.toFixed(4);
    default:
      return String(value);
  }
};

const getScoreLabel = (key: string): string => {
  switch (key) {
    case 'performance': return 'Performance';
    case 'accessibility': return 'Accessibility';
    case 'seo': return 'SEO';
    case 'best_practices': return 'Best Practices';
    default: return key;
  }
};

// Transform backend result to frontend format
const mapBackendResult = (r: BackendResultItem): ResultItem => ({
  id: r.id,
  url: r.url,
  device: r.device,
  status: r.status,
  reason: r.reason,
  scores: {
    performance: r.performance_score,
    accessibility: null,
    seo: r.seo_score,
    best_practices: null,
  },
  metrics: {
    fcp_ms: r.fcp_ms,
    lcp_ms: r.lcp_ms,
    tbt_ms: r.tbt_ms,
    cls: r.cls,
    speed_index_ms: null,
  },
  recommendations: r.recommendations || [],
});

function ScoreGauge({ score, label, size = 80 }: { score: number | null; label: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? score / 100 : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const color = getScoreColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: size + 16 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span style={{ fontSize: '20px', fontWeight: '700', color: color }}>
          {score !== null ? score : '—'}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, metricType }: { label: string; value: number | null; unit: string; metricType: 'fcp' | 'lcp' | 'tbt' | 'cls' | 'speed_index' }) {
  const color = getMetricColor(metricType, value);
  const displayValue = formatMetricValue(metricType, value);

  return (
    <div
      style={{
        flex: 1,
        minWidth: '120px',
        padding: '16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: '700', color, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
        {displayValue}
        <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '2px' }}>{unit}</span>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: ResultItem }) {
  const scoreEntries = Object.entries(result.scores).filter(([, v]) => v !== null) as [string, number][];
  const metrics = [
    { label: 'FCP', value: result.metrics.fcp_ms, unit: 'ms', type: 'fcp' as const },
    { label: 'LCP', value: result.metrics.lcp_ms, unit: 'ms', type: 'lcp' as const },
    { label: 'TBT', value: result.metrics.tbt_ms, unit: 'ms', type: 'tbt' as const },
    { label: 'CLS', value: result.metrics.cls, unit: '', type: 'cls' as const },
    { label: 'Speed Index', value: result.metrics.speed_index_ms, unit: 'ms', type: 'speed_index' as const },
  ].filter(m => m.value !== null);

  const [showAllRecs, setShowAllRecs] = useState(false);

  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--primary)',
            textDecoration: 'none',
            wordBreak: 'break-all',
            maxWidth: '60%',
          }}
          title={result.url}
        >
          {result.url}
        </a>
        <span
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            borderRadius: '999px',
            background: result.status === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: result.status === 'success' ? '#22c55e' : '#ef4444',
            whiteSpace: 'nowrap',
          }}
        >
          {result.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {scoreEntries.map(([key, score]) => (
          <ScoreGauge key={key} score={score} label={getScoreLabel(key)} size={72} />
        ))}
      </div>

      {metrics.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {metrics.map((m, i) => (
            <MetricCard
              key={i}
              label={m.label}
              value={m.value}
              unit={m.unit}
              metricType={m.type}
            />
          ))}
        </div>
      )}

      {result.recommendations && result.recommendations.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <details>
            <summary
              style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text)',
                cursor: 'pointer',
                padding: '8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="8" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Recommendations ({result.recommendations.length})
            </summary>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(showAllRecs ? result.recommendations : result.recommendations.slice(0, 3)).map((rec, i) => {
                // Extract evidence URLs from evidence array or where_to_fix
                const evidenceUrls = rec.evidence?.map((e: { url: string }) => e.url).filter(Boolean) || 
                  (rec.where_to_fix ? rec.where_to_fix.split(';').map((u: string) => u.trim()).filter(Boolean) : []);
                
                // Get category badge color
                const categoryColor = rec.category === 'Performance' ? '#3b82f6' :
                  rec.category === 'Accessibility' ? '#22c55e' :
                  rec.category === 'Best Practices' ? '#8b5cf6' :
                  rec.category === 'SEO' ? '#f97316' : 'var(--text-muted)';
                
                // Format savings display
                const savingsDisplay = rec.display_value || 
                  (rec.estimated_savings_bytes ? `~${Math.round(rec.estimated_savings_bytes / 1024)} KiB` : null) ||
                  (rec.estimated_savings_ms ? `${rec.estimated_savings_ms} ms` : null);
                
                return (
                  <div
                    key={rec.audit_id || i}
                    style={{
                      padding: '14px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                    }}
                  >
                    {/* Title row with category badge and score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        color: '#fff', 
                        background: categoryColor, 
                        padding: '2px 8px', 
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {rec.category}
                      </span>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '500', 
                        color: 'var(--text-muted)',
                        padding: '2px 8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                      }}>
                        Score: {rec.score}
                      </span>
                      {savingsDisplay && (
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '500', 
                          color: '#22c55e',
                          padding: '2px 8px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          borderRadius: '4px',
                        }}>
                          {savingsDisplay}
                        </span>
                      )}
                    </div>
                    
                    {/* Issue title */}
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                      {rec.title}
                    </div>
                    
                    {/* Description / Impact */}
                    {rec.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                        <strong>Impact:</strong> {rec.description}
                      </div>
                    )}
                    
                    {/* Recommended fix */}
                    {rec.recommendation && (
                      <div style={{ fontSize: '12px', color: '#93c5fd', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                        <strong>Recommended fix:</strong> {rec.recommendation}
                      </div>
                    )}
                    
                    {/* Evidence URLs */}
                    {evidenceUrls.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        <strong>Evidence ({evidenceUrls.length}):</strong>
                        <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {evidenceUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '11px',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                wordBreak: 'break-all',
                                padding: '2px 8px',
                                background: 'rgba(37, 99, 235, 0.1)',
                                borderRadius: '4px',
                              }}
                              title={url}
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {result.recommendations.length > 3 && !showAllRecs && (
                <button
                  onClick={() => setShowAllRecs(true)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--primary)',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Show all {result.recommendations.length}
                </button>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

export function PageSpeedTool({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');
  const [devices, setDevices] = useState<Device[]>(DEVICE_OPTIONS.map(d => d.value));
  const [category, setCategory] = useState<Category[]>(CATEGORY_OPTIONS.map(c => c.value));
  const [version, setVersion] = useState<Version[]>(VERSION_OPTIONS.map(v => v.value));
  const [maxPages, setMaxPages] = useState<string>('4');
  const [isLoading, setIsLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollingResults, setPollingResults] = useState(false);
  const [checkId, setCheckId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [lastResultCount, setLastResultCount] = useState(0);

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

  const toggleDevice = useCallback((d: Device) => {
    setDevices(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }, []);

  const toggleCategory = useCallback((cat: Category) => {
    setCategory(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }, []);

  const toggleVersion = useCallback((v: Version) => {
    setVersion(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }, []);

  const startCheck = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    if (devices.length === 0) {
      setError('Please select at least one device');
      return;
    }
    if (category.length === 0) {
      setError('Please select at least one category');
      return;
    }
    if (version.length === 0) {
      setError('Please select at least one version');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus(null);
    setResults([]);
    setLastResultCount(0);
    setCheckId(null);
    setCurrentPhase('queued');

    try {
      const maxPagesNum = parseInt(maxPages, 10);
      const res = await fetch('/api/v1/lighthouse/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized, device: devices, category, version, max_pages: maxPagesNum }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: CheckResponse = await res.json();
      setCheckId(data.check_id);
      setCurrentPhase('queued');
      setIsLoading(false);
      setPolling(true);
      setPollingResults(true);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to start check');
    }
  };

  const pollStatus = useCallback(async () => {
    if (!checkId) return;

    try {
      const res = await fetch(`/api/v1/lighthouse/status/${checkId}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: StatusResponse = await res.json();
      setStatus(data);
      setCurrentPhase(data.phase);

      if (data.status === 'completed' || data.status === 'failed') {
        setPolling(false);
        setPollingResults(false);
        if (data.status === 'completed') {
          await fetchResults(data.check_id);
        } else {
          setError(data.error || 'Check failed');
        }
      }
    } catch (err) {
      setPolling(false);
      setPollingResults(false);
      setError(err instanceof Error ? err.message : 'Failed to poll status');
    }
  }, [checkId]);

  const fetchResults = async (checkId: string) => {
    try {
      const res = await fetch(`/api/v1/lighthouse/results/${checkId}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data: BackendResultItem[] = await res.json();
      const mapped = data.map(mapBackendResult);
      setResults(mapped);
      setLastResultCount(mapped.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    }
  };

  const pollResults = useCallback(async () => {
    if (!checkId) return;
    try {
      const res = await fetch(`/api/v1/lighthouse/results/${checkId}`);
      if (!res.ok) return;
      const data: BackendResultItem[] = await res.json();
      const mapped = data.map(mapBackendResult);
      // Only update if new results arrived (backend returns cumulative results)
      if (mapped.length > lastResultCount) {
        setResults(mapped);
        setLastResultCount(mapped.length);
      }
    } catch {
      // Silently ignore result fetch errors; status polling handles terminal errors
    }
  }, [checkId, lastResultCount]);

  // Status polling (every 2-3s) - live progress
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(pollStatus, 2500);
    pollStatus();
    return () => clearInterval(interval);
  }, [polling, pollStatus]);

  // Results polling (every 12s) - incremental results
  useEffect(() => {
    if (!pollingResults) return;
    const interval = setInterval(pollResults, 12000);
    pollResults(); // Initial fetch
    return () => clearInterval(interval);
  }, [pollingResults, pollResults]);

  return (
    <ToolInputWrapper
      title="PageSpeed Analysis"
      desc="Analyze page performance, Core Web Vitals, and get optimization suggestions."
      onBack={onBack}
    >
      <ToolInputForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={startCheck}
        isLoading={isLoading || polling}
        submitLabel={polling ? 'Analyzing...' : isLoading ? 'Starting...' : 'Analyze'}
        inputPlaceholder="example.com"
        extraFields={
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Device
              </label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {DEVICE_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--text)',
                    }}
                  >
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={devices.includes(opt.value)}
                      onChange={() => toggleDevice(opt.value)}
                      style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Categories
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CATEGORY_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--text)',
                    }}
                  >
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={category.includes(opt.value)}
                      onChange={() => toggleCategory(opt.value)}
                      style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Lighthouse Version
              </label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {VERSION_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--text)',
                    }}
                  >
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={version.includes(opt.value)}
                      onChange={() => toggleVersion(opt.value)}
                      style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Max Pages
              </label>
              <input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(e.target.value)}
                min="1"
                max="100"
                disabled={isLoading || polling}
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
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              />
            </div>
          </>
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

      {polling && status && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>
              {currentPhase === 'pagespeed' ? 'Running PageSpeed checks...' : currentPhase === 'crawling' ? 'Crawling pages...' : 'Processing...'}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {status.progress_percent}%
            </span>
          </div>
          <div
            style={{
              height: '8px',
              background: 'var(--border)',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${status.progress_percent}%`,
                background: status.progress_percent > 0
                  ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                  : 'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 8px, #2563eb 8px, #2563eb 16px)',
                backgroundSize: status.progress_percent > 0 ? 'auto' : '20px 20px',
                borderRadius: '4px',
                transition: 'width 0.5s ease',
                animation: status.progress_percent === 0 ? 'progressShimmer 1.5s infinite linear' : 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>Discovered: {status.pages_discovered}</span>
            <span>Crawled: {status.pages_crawled}</span>
            <span>Checked: {status.pagespeed_checked}/{status.pagespeed_total}</span>
            <span>Succeeded: {status.pagespeed_succeeded}</span>
            <span>Failed: {status.pagespeed_failed}</span>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            Results ({results.length} pages)
          </h3>
          <div style={{ maxHeight: '600px', overflow: 'auto' }}>
            {results.map((result, idx) => (
              <ResultCard key={result.id || idx} result={result} />
            ))}
          </div>
        </div>
      )}
    </ToolInputWrapper>
  );
}