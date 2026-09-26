import { useState, useCallback } from 'react';
import { ToolInputForm, ToolInputWrapper } from './ToolCard';
import { useSitemapCheck } from '../../hooks/useSitemapCheck';
import type { OverallStatus, Severity, SitemapItem, SitemapFinding, SitemapRecommendation, SitemapSummary as SitemapSummaryType } from '../../types/sitemap';

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

function getStatusConfig(status: OverallStatus | undefined) {
  const s = (status || '').toLowerCase();
  if (s === 'pass') return { label: 'All checks passed', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' };
  if (s === 'warning') return { label: 'Minor issues detected', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' };
  if (s === 'fail') return { label: 'Issues detected', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
  if (s === 'not_applicable') return { label: 'Not applicable', color: 'var(--text-muted)', bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.2)' };
  return { label: 'Unknown', color: 'var(--text-muted)', bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.2)' };
}

function getSeverityColor(severity: Severity | undefined): string {
  const s = (severity || '').toLowerCase();
  if (s === 'critical' || s === 'high') return 'var(--danger)';
  if (s === 'medium') return '#fbbf24';
  if (s === 'low') return '#3b82f6';
  if (s === 'none') return 'var(--success)';
  return 'var(--text-muted)';
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function KindBadge({ isIndex }: { isIndex: boolean }) {
  const label = isIndex ? 'Index' : 'URL Set';
  const bg = isIndex ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)';
  const color = isIndex ? '#a78bfa' : '#60a5fa';
  return (
    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: bg, color }}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: OverallStatus }) {
  const configs: Record<OverallStatus, { label: string; color: string; bg: string }> = {
    pass: { label: 'Pass', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.15)' },
    warning: { label: 'Warning', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
    fail: { label: 'Fail', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.15)' },
    not_applicable: { label: 'N/A', color: 'var(--text-muted)', bg: 'rgba(148, 163, 184, 0.15)' },
  };
  const config = configs[status] || configs.not_applicable;
  return (
    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: config.bg, color: config.color }}>
      {config.label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const color = getSeverityColor(severity);
  return (
    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: `${color}15`, color, border: `1px solid ${color}40` }}>
      {severity}
    </span>
  );
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '600', color: valueColor || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, color = 'var(--primary)' }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{ padding: '16px 20px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center', minWidth: '120px', flex: 1 }}>
      <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function FindingRow({ finding, recommendation }: { finding: SitemapFinding; recommendation?: SitemapRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = getSeverityColor(finding.severity);
  const statusIcon = finding.status === 'pass' ? '✓' : finding.status === 'fail' ? '✗' : '⚠';

  return (
    <div style={{ border: `1px solid ${expanded ? statusColor : 'var(--border)'}`, borderRadius: '10px', background: expanded ? 'rgba(37, 99, 235, 0.04)' : 'var(--card-bg)', overflow: 'hidden', transition: 'all 0.2s' }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        aria-expanded={expanded}
      >
        <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
          {statusIcon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
              {finding.message.split(':')[0] || finding.code}
            </h5>
            <StatusBadge status={finding.status} />
            <SeverityBadge severity={finding.severity} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {finding.message}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          {recommendation && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>Fix available</span>}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px' }}>
            <div>
              <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>What</h6>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{finding.message}</p>
            </div>

            {finding.evidence && (
              <div>
                <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>Evidence</h6>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: 0, fontFamily: 'monospace' }}>{finding.evidence}</p>
              </div>
            )}

            <div>
              <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>Where</h6>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: 0, fontFamily: 'monospace' }}>
                Sitemap check — finding code: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{finding.code}</code>
              </p>
            </div>

            {recommendation && (
              <div>
                <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>Recommended fix</h6>
                <p style={{ fontSize: '13px', color: '#93c5fd', lineHeight: 1.5, margin: 0 }}>{recommendation.fix}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationRow({ rec }: { rec: SitemapRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const color = getSeverityColor(rec.priority);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--card-bg)', overflow: 'hidden', transition: 'all 0.2s' }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        aria-expanded={expanded}
      >
        <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
          {rec.priority === 'critical' || rec.priority === 'high' ? '!' : rec.priority === 'medium' ? '⚠' : 'ℹ'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{rec.title}</h5>
            <SeverityBadge severity={rec.priority} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {rec.message}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px' }}>
            <div>
              <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>Recommended fix</h6>
              <p style={{ fontSize: '13px', color: '#93c5fd', lineHeight: 1.5, margin: 0 }}>{rec.fix}</p>
            </div>

            {rec.evidence.length > 0 && (
              <div>
                <h6 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>Evidence URLs</h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {rec.evidence.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all', padding: '2px 8px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '4px' }} title={url}>
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportMarkdown({ markdown }: { markdown: string }) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Audit Report</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}>
          <input type="checkbox" checked={showRaw} onChange={(e) => setShowRaw(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
          Show raw Markdown
        </label>
      </div>
      <div style={{ padding: '16px 20px', maxHeight: '500px', overflow: 'auto' }}>
        {showRaw ? (
          <pre style={{ margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '12px', lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
            {markdown}
          </pre>
        ) : (
          <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }} />
        )}
      </div>
    </div>
  );
}

function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: 600; margin: 16px 0 8px; color: var(--text);">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 18px; font-weight: 600; margin: 20px 0 10px; color: var(--text);">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 22px; font-weight: 600; margin: 24px 0 12px; color: var(--text);">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li style="margin: 4px 0; color: var(--text);">$1</li>')
    .replace(/^- (.*$)/gim, '<li style="margin: 4px 0; color: var(--text);">$1</li>')
    .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
    .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
    .replace(/\n\n/g, '</p><p style="margin: 8px 0;">')
    .replace(/\n/g, '<br>');
}

function SitemapSummary({ summary, overallStatus, severity, checkedAt, costSeconds, robots }: { 
  summary: SitemapSummaryType;
  overallStatus: OverallStatus;
  severity: Severity;
  checkedAt: string;
  costSeconds: number;
  robots?: { exists: boolean; status_code: number | null; sitemap_references: string[] };
}) {
  const config = getStatusConfig(overallStatus);
  const severityColor = getSeverityColor(severity);

  return (
    <div style={{ padding: '20px', background: config.bg, border: `1px solid ${config.border}`, borderRadius: '12px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: '700' }}>
          {overallStatus === 'pass' ? '✓' : overallStatus === 'fail' ? '✗' : overallStatus === 'warning' ? '⚠' : '−'}
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: config.color }}>{config.label}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Severity: <span style={{ color: severityColor, fontWeight: '600' }}>{severity}</span>
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Checked: {new Date(checkedAt).toLocaleString()}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration: {costSeconds.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <StatCard label="Sitemap Files" value={summary.total_sitemaps} />
        <StatCard label="Sitemap Indexes" value={summary.sitemap_indexes} />
        <StatCard label="URL Sitemaps" value={summary.url_sitemaps} />
        <StatCard label="Total URLs" value={formatNumber(summary.total_urls_declared)} />
        <StatCard label="Total Issues" value={summary.total_issues} color={summary.total_issues > 0 ? 'var(--danger)' : 'var(--success)'} />
      </div>

      {robots && (
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SummaryRow label="robots.txt" value={robots.exists ? 'Found' : 'Not found'} valueColor={robots.exists ? 'var(--success)' : 'var(--danger)'} />
          <SummaryRow label="HTTP Status" value={robots.status_code ? String(robots.status_code) : '—'} />
          {robots.sitemap_references?.length > 0 && (
            <SummaryRow label="Sitemap References" value={robots.sitemap_references.length} />
          )}
        </div>
      )}
    </div>
  );
}

function SitemapsTable({ sitemaps }: { sitemaps: SitemapItem[] }) {
  if (!sitemaps.length) return null;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Sitemap Files ({sitemaps.length})</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kind</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Entries</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Size</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Response Time</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Issues</th>
            </tr>
          </thead>
          <tbody>
            {sitemaps.map((file, i) => (
              <tr key={file.url} style={{ borderBottom: i < sitemaps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{i + 1}</td>
                <td style={{ padding: '12px 16px', maxWidth: '350px' }}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all', display: 'block' }} title={file.url}>
                    {file.url}
                  </a>
                </td>
                <td style={{ padding: '12px 16px' }}><KindBadge isIndex={file.is_index} /></td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: file.status_code ? (file.status_code >= 200 && file.status_code < 400 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
                  {file.status_code || '—'}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text)' }}>{formatNumber(file.entry_count)}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{formatBytes(file.content_length)}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{formatMs(file.response_time_ms)}</td>
                <td style={{ padding: '12px 16px' }}>
                  {file.issues.length > 0 ? (
                    <span style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {file.issues.map((issue: SitemapFinding, idx: number) => (
                        <span key={idx} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', textTransform: 'lowercase' }}>{issue.code}</span>
                      ))}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: '12px' }}>✓ Clean</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FindingsList({ findings, recommendations }: { findings: SitemapFinding[]; recommendations: SitemapRecommendation[] }) {
  if (!findings.length) return null;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Findings ({findings.length})</h3>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {findings.map((finding, i) => (
          <FindingRow key={finding.code || i} finding={finding} recommendation={recommendations.find(r => r.code === finding.code)} />
        ))}
      </div>
    </div>
  );
}

function RecommendationsList({ recommendations }: { recommendations: SitemapRecommendation[] }) {
  if (!recommendations.length) return null;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Recommendations ({recommendations.length})</h3>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recommendations.map((rec, i) => (
          <RecommendationRow key={rec.code || i} rec={rec} />
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ phase, message }: { phase: string; message: string }) {
  const phaseLabels: Record<string, string> = {
    discovering: 'Discovering sitemaps...',
    evaluating: 'Evaluating sitemaps...',
    completed: 'Completed',
  };

  const phasePercent: Record<string, number> = {
    discovering: 30,
    evaluating: 70,
    completed: 100,
  };

  const percent = phasePercent[phase] || 0;
  const label = phaseLabels[phase] || message;

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
            background: percent > 0 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 8px, #2563eb 8px, #2563eb 16px)',
            backgroundSize: percent > 0 ? 'auto' : '20px 20px',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
            animation: percent === 0 ? 'progressShimmer 1.5s infinite linear' : 'none',
          }}
        />
      </div>
      <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

export function SitemapTool({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');
  const {
    phase,
    error,
    resultResponse,
    progress,
    runCheck,
    clearError,
    reset,
  } = useSitemapCheck();

  const handleSubmit = useCallback(() => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    runCheck({ url: normalized });
  }, [url, runCheck]);

  const handleRetry = useCallback(() => {
    if (url) {
      runCheck({ url });
    }
  }, [url, runCheck]);

  return (
    <ToolInputWrapper
      title="Sitemap Analyzer"
      desc="Comprehensive sitemap analysis including structure validation, URL discovery, and robots.txt integration."
      onBack={onBack}
    >
      <ToolInputForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleSubmit}
        isLoading={phase === 'submitting' || phase === 'polling'}
        submitLabel={phase === 'polling' ? 'Analyzing...' : phase === 'submitting' ? 'Starting...' : 'Analyze Sitemap'}
        inputPlaceholder="https://example.com"
      />

      {error && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span>{error}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={clearError} style={{ padding: '8px 16px', fontSize: '12px', color: '#fca5a5', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer' }}>Dismiss</button>
            <button onClick={handleRetry} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '500', color: '#fff', background: 'var(--danger)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Retry</button>
          </div>
        </div>
      )}

      {(phase === 'polling' || phase === 'submitting') && progress && (
        <ProgressBar phase={progress.phase} message={progress.message} />
      )}

      {phase === 'completed' && resultResponse && (
        <>
          <SitemapSummary
            summary={resultResponse.summary}
            overallStatus={resultResponse.overall_status}
            severity={resultResponse.severity}
            checkedAt={resultResponse.checked_at}
            costSeconds={resultResponse.cost_seconds}
            robots={{
              exists: resultResponse.sitemaps.some(s => s.url.includes('robots.txt')),
              status_code: null,
              sitemap_references: [],
            }}
          />

          <SitemapsTable sitemaps={resultResponse.sitemaps} />

          <FindingsList findings={resultResponse.findings} recommendations={resultResponse.recommendations} />

          <RecommendationsList recommendations={resultResponse.recommendations} />

          {resultResponse.report_markdown && (
            <ReportMarkdown markdown={resultResponse.report_markdown} />
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={reset}
              style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Run New Analysis
            </button>
          </div>
        </>
      )}
    </ToolInputWrapper>
  );
}