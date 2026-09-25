import { useState, useCallback } from 'react';
import { ToolInputForm, ToolInputWrapper } from './ToolCard';
import type {
  RobotsCheckResponse,
  CrawlerRule,
  MatchedFinding,
} from '../../types/robots';

function normalizeDomain(input: string): string {
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

function parseCrawlerRules(raw: string): CrawlerRule[] {
  const lines = raw.split(/\r?\n/);
  const rules: CrawlerRule[] = [];
  let currentUserAgent = '*';

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex <= 0) continue;

    const directive = trimmed.substring(0, colonIndex).trim().toLowerCase();
    const value = trimmed.substring(colonIndex + 1).trim();

    if (directive === 'user-agent') {
      currentUserAgent = value;
    }

    if (directive === 'disallow' || directive === 'allow') {
      rules.push({
        userAgent: currentUserAgent,
        directive: directive.charAt(0).toUpperCase() + directive.slice(1),
        value,
        lineNumber: i + 1,
      });
    }
  }

  return rules;
}

function groupCrawlerRules(rules: CrawlerRule[]): Record<string, CrawlerRule[]> {
  const groups: Record<string, CrawlerRule[]> = {};
  for (const rule of rules) {
    const key = rule.userAgent;
    if (!groups[key]) groups[key] = [];
    groups[key].push(rule);
  }
  return groups;
}

function matchFindingsToRecommendations(
  findings: RobotsCheckResponse['findings'],
  recommendations: RobotsCheckResponse['recommendations'],
): MatchedFinding[] {
  return findings.map((finding) => ({
    finding,
    recommendation: recommendations.find((r) => r.code === finding.code),
  }));
}

function getStatusIcon(status: string | undefined): string {
  const s = (status || '').toLowerCase();
  if (s === 'good' || s === 'passed' || s === 'success' || s === 'completed') return '✓';
  return '⚠';
}

function getStatusColor(status: string | undefined): string {
  const s = (status || '').toLowerCase();
  if (s === 'good' || s === 'passed' || s === 'success' || s === 'completed') return 'var(--success)';
  if (s === 'failed' || s === 'error') return 'var(--danger)';
  return '#fbbf24';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getOverallStatusConfig(status: string | undefined): { label: string; color: string; bg: string; border: string } {
  const s = (status || '').toLowerCase().trim();
  if (s === 'good' || s === 'passed' || s === 'success') {
    return { label: 'All checks passed', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' };
  }
  if (s === 'warning' || s === 'warn') {
    return { label: 'Minor issues', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' };
  }
  if (s === 'error' || s === 'failed' || s === 'critical') {
    return { label: 'Issues detected', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
  }
  return { label: 'Issues detected', color: 'var(--text-muted)', bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.2)' };
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div
      className="robots-summary-row"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '600', color: valueColor || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function SitemapReachabilityBadge({ sitemap }: { sitemap: { url: string; reachable: boolean; status_code: number; error: string | null } }) {
  const reachable = sitemap.reachable;
  const dotColor = reachable ? 'var(--success)' : 'var(--danger)';
  const statusText = reachable
    ? `Reachable (${sitemap.status_code})`
    : sitemap.error
      ? `Unreachable — ${sitemap.error}`
      : `Unreachable (${sitemap.status_code || 'N/A'})`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <span style={{ fontSize: '12px', color: reachable ? '#9ca3af' : '#fca5a5' }}>{statusText}</span>
    </div>
  );
}

function TreeItem({ label, status = 'default', icon }: { label: string; status?: 'ok' | 'warn' | 'error' | 'default'; icon?: string }) {
  let color = 'var(--text-muted)';
  if (status === 'ok') color = 'var(--success)';
  if (status === 'warn') color = '#fbbf24';
  if (status === 'error') color = 'var(--danger)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color }}>
      {icon && <span style={{ fontSize: '11px', opacity: 0.7 }}>{icon}</span>}
      <span>{label}</span>
    </div>
  );
}

export function RobotsTxtTool({ onBack }: { onBack: () => void }) {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RobotsCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleIssue = (findingId: string) => {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(findingId)) next.delete(findingId);
      else next.add(findingId);
      return next;
    });
  };

  const handleCheck = useCallback(async () => {
    const normalized = normalizeDomain(domain);
    if (!normalized) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setExpandedSections({});
    setExpandedIssues(new Set());

    try {
      const res = await fetch('/api/v1/robots/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: normalized }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: RobotsCheckResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check robots.txt');
    } finally {
      setIsLoading(false);
    }
  }, [domain]);

  const renderResult = () => {
    if (!result) return null;

    const rawContent = result.raw_content || '';
    const crawlerRules = parseCrawlerRules(rawContent);
    const groupedRules = groupCrawlerRules(crawlerRules);
    const userAgentGroups = Object.entries(groupedRules);
    const matchedFindings = matchFindingsToRecommendations(result.findings, result.recommendations);
    const statusConfig = getOverallStatusConfig(result.overall_status);
    const sitemapCount = result.sitemaps_declared?.length || 0;
    const issueCount = matchedFindings.length;

    const accessible = result.exists ? '✓' : '✗';
    const accessibleColor = result.exists ? 'var(--success)' : 'var(--danger)';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Summary Box */}
        <div
          className="robots-summary-box"
          style={{
            padding: '20px',
            background: statusConfig.bg,
            border: `1px solid ${statusConfig.border}`,
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: statusConfig.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '700',
              }}
            >
              {getStatusIcon(result.overall_status)}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: statusConfig.color }}>
                {statusConfig.label}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {result.severity || 'N/A'} severity
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SummaryRow label="Accessible" value={accessible} valueColor={accessibleColor} />
            <SummaryRow label="HTTP status" value={result.status_code ? String(result.status_code) : '—'} />
            <SummaryRow
              label="Sitemap"
              value={sitemapCount > 0 ? `${sitemapCount} ✓` : '0'}
              valueColor={sitemapCount > 0 ? 'var(--success)' : 'var(--text-muted)'}
            />
            <SummaryRow label="Crawler rules" value={String(crawlerRules.length)} />
            <SummaryRow
              label="Issues"
              value={issueCount > 0 ? `${issueCount} ⚠` : '0 ✓'}
              valueColor={issueCount > 0 ? '#fbbf24' : 'var(--success)'}
            />
          </div>
        </div>

        {/* Sitemaps Section */}
        <div className="robots-results-card">
          <div
            className="robots-section-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: sitemapCount > 0 ? 'pointer' : 'default',
            }}
            onClick={() => sitemapCount > 0 && toggleSection('sitemaps')}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
              Sitemaps ({sitemapCount})
            </h4>
            {sitemapCount > 0 && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: expandedSections.sitemaps ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: 'var(--text-muted)',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </div>

          {sitemapCount > 0 && expandedSections.sitemaps !== false && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {result.sitemaps_declared.map((sitemapUrl, idx) => {
                const reachability = result.sitemap_reachability?.[idx];
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        ├──
                      </span>
                      <a
                        href={sitemapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '13px',
                          color: 'var(--primary)',
                          textDecoration: 'none',
                          wordBreak: 'break-all',
                        }}
                        title={sitemapUrl}
                      >
                        {sitemapUrl}
                      </a>
                    </div>
                    {reachability && (
                      <div style={{ marginLeft: '20px' }}>
                        <SitemapReachabilityBadge sitemap={reachability} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Crawler Rules Section */}
        <div className="robots-results-card">
          <div
            className="robots-section-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: crawlerRules.length > 0 ? 'pointer' : 'default',
            }}
            onClick={() => crawlerRules.length > 0 && toggleSection('crawler-rules')}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
              Crawler Rules ({crawlerRules.length})
            </h4>
            {crawlerRules.length > 0 && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: expandedSections['crawler-rules'] ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: 'var(--text-muted)',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </div>

          {crawlerRules.length > 0 && expandedSections['crawler-rules'] !== false && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userAgentGroups.map(([userAgent, rules]) => (
                <div key={userAgent}>
                  <TreeItem label={`User-agent: ${userAgent}`} status="default" icon="🤖" />
                  <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {rules.map((rule, idx) => {
                      const isBlank = rule.value === '' || !rule.value;
                      const status = isBlank ? 'warn' : 'ok';
                      const displayValue = isBlank ? '(empty — allow all)' : rule.value;
                      const isLast = idx === rules.length - 1;
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', opacity: isLast ? 0.5 : 0.7 }}>
                            {isLast ? '└──' : '├──'}
                          </span>
                          <TreeItem
                            label={`${rule.directive}: ${displayValue}`}
                            status={status}
                            icon={rule.directive === 'Disallow' ? '🚫' : '✅'}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {crawlerRules.length === 0 && rawContent && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>
              No disallow or allow directives found.
            </p>
          )}
        </div>

        {/* Issues Section */}
        <div className="robots-results-card">
          <div
            className="robots-section-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: issueCount > 0 ? 'pointer' : 'default',
            }}
            onClick={() => issueCount > 0 && toggleSection('issues')}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
              Issues ({issueCount})
            </h4>
            {issueCount > 0 && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: expandedSections.issues ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: 'var(--text-muted)',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </div>

          {issueCount > 0 && expandedSections.issues !== false && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matchedFindings.map((matched, idx) => {
                const findingId = matched.finding.code || `finding-${idx}`;
                const isExpanded = expandedIssues.has(findingId);
                const severityColor = getStatusColor(matched.finding.status);
                const isLast = idx === matchedFindings.length - 1;

                return (
                  <div
                    key={findingId}
                    className="robots-issue-card"
                    style={{
                      border: `1px solid ${isExpanded ? severityColor : 'var(--border)'}`,
                      borderRadius: '10px',
                      background: isExpanded ? 'rgba(37, 99, 235, 0.04)' : 'var(--card-bg)',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleIssue(findingId)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      aria-expanded={isExpanded}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: severityColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '700',
                          flexShrink: 0,
                        }}
                      >
                        ⚠
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
                            {matched.finding.message.split(':')[0] || 'Issue'}
                          </h5>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              background: 'rgba(251, 191, 36, 0.15)',
                              color: '#fbbf24',
                              border: '1px solid rgba(251, 191, 36, 0.4)',
                            }}
                          >
                            {matched.finding.severity}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {matched.finding.message}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                        {matched.recommendation && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>
                            Fix available
                          </span>
                        )}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px' }}>
                          <div>
                            <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                              What
                            </h6>
                            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                              {matched.finding.message}
                            </p>
                          </div>

                          {matched.finding.evidence && (
                            <div>
                              <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                Evidence
                              </h6>
                              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: 0, fontFamily: 'monospace' }}>
                                {matched.finding.evidence}
                              </p>
                            </div>
                          )}

                          <div>
                            <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                              Where
                            </h6>
                            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: 0, fontFamily: 'monospace' }}>
                              {result.fetch_url || 'robots.txt'} — finding code: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{matched.finding.code}</code>
                            </p>
                          </div>

                          <div>
                            <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                              Why
                            </h6>
                            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                              {result.why || matched.finding.evidence || 'This issue was detected during robots.txt analysis.'}
                            </p>
                          </div>

                          {matched.recommendation && (
                            <div>
                              <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                Recommended fix
                              </h6>
                              <p style={{ fontSize: '13px', color: '#93c5fd', lineHeight: 1.5, margin: 0 }}>
                                {matched.recommendation.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!isLast && <div style={{ height: '1px', background: 'var(--border)', marginLeft: '36px' }} />}
                  </div>
                );
              })}
            </div>
          )}

          {issueCount === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>
              No issues found. Your robots.txt looks good!
            </p>
          )}
        </div>

        {/* Raw robots.txt */}
        <div className="robots-results-card">
          <button
            type="button"
            onClick={() => toggleSection('raw')}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: '500',
            }}
            aria-expanded={expandedSections.raw}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: expandedSections.raw ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                color: 'var(--text-muted)',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Raw robots.txt
            {result.size_bytes && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {formatBytes(result.size_bytes)}
              </span>
            )}
          </button>

          {expandedSections.raw && rawContent && (
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
                borderRadius: '0 0 12px 12px',
                overflow: 'auto',
                maxHeight: '400px',
              }}
            >
              {rawContent}
            </pre>
          )}
        </div>
      </div>
    );
  };

  return (
    <ToolInputWrapper
      title="robots.txt Inspector"
      desc="Fetch and analyze robots.txt to understand crawling rules and disallowed paths."
      onBack={onBack}
    >
      <ToolInputForm
        url={domain}
        onUrlChange={setDomain}
        onSubmit={handleCheck}
        isLoading={isLoading}
        submitLabel="Check"
        inputPlaceholder="example.com"
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

      {result && !result.exists && result.fetch_status === 'failed' && (
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
          robots.txt was not found at this domain.
        </div>
      )}

      {result && renderResult()}
    </ToolInputWrapper>
  );
}
