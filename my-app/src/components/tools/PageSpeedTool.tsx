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

type Device = typeof DEVICE_OPTIONS[number]['value'];
type Category = typeof CATEGORY_OPTIONS[number]['value'];

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

interface ResultItem {
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
      return `${value}ms`;
    case 'cls':
      return value.toFixed(4);
    default:
      return String(value);
  }
};

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

function MetricCard({ label, value, unit, metricType }: { label: string; value: number | null; unit: string; metricType: 'fcp' | 'lcp' | 'tbt' | 'cls' }) {
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
  const metrics = [
    { label: 'FCP', value: result.fcp_ms, unit: 'ms', type: 'fcp' as const },
    { label: 'LCP', value: result.lcp_ms, unit: 'ms', type: 'lcp' as const },
    { label: 'TBT', value: result.tbt_ms, unit: 'ms', type: 'tbt' as const },
    { label: 'CLS', value: result.cls, unit: '', type: 'cls' as const },
  ].filter(m => m.value !== null);

  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
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
        <ScoreGauge score={result.performance_score} label="Performance" size={72} />
        <ScoreGauge score={result.seo_score} label="SEO" size={72} />
      </div>

      {metrics.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
    </div>
  );
}

export function PageSpeedTool({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');
  const [device, setDevice] = useState<Device>('mobile');
  const [categories, setCategories] = useState<Category[]>(CATEGORY_OPTIONS.map(c => c.value));
  const [maxPages, setMaxPages] = useState<string>('4');
  const [isLoading, setIsLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [checkId, setCheckId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('');

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

  const toggleCategory = useCallback((cat: Category) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }, []);

  const startCheck = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    if (categories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus(null);
    setResults([]);
    setCheckId(null);
    setCurrentPhase('queued');

    try {
      const maxPagesNum = parseInt(maxPages, 10);
      const res = await fetch('/api/v1/lighthouse/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized, device, categories, max_pages: maxPagesNum }),
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
        if (data.status === 'completed') {
          await fetchResults(data.check_id);
        } else {
          setError(data.error || 'Check failed');
        }
      }
    } catch (err) {
      setPolling(false);
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
      const data: ResultItem[] = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    }
  };

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(pollStatus, 2000);
    pollStatus();
    return () => clearInterval(interval);
  }, [polling, pollStatus]);

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
                      type="radio"
                      name="device"
                      value={opt.value}
                      checked={device === opt.value}
                      onChange={() => setDevice(opt.value)}
                      style={{ accentColor: 'var(--accent)' }}
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
                      checked={categories.includes(opt.value)}
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
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {results.map((result, idx) => (
              <ResultCard key={result.id || idx} result={result} />
            ))}
          </div>
        </div>
      )}
    </ToolInputWrapper>
  );
}