import { useState, useCallback } from 'react';
import { ToolInputForm, ToolInputWrapper } from './ToolCard';
import { useSitemapCheck } from '../../hooks/useSitemapCheck';
import type { SitemapFilePageItem, FindingStatus, FindingSeverity, SitemapHealth } from '../../types/sitemap';

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

function getStatusConfig(status: FindingStatus | undefined) {
  const s = (status || '').toLowerCase();
  if (s === 'pass') return { label: 'All checks passed', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' };
  if (s === 'warning') return { label: 'Minor issues', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' };
  if (s === 'fail') return { label: 'Issues detected', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
  return { label: 'Unknown', color: 'var(--text-muted)', bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.2)' };
}

function getSeverityColor(severity: FindingSeverity | undefined): string {
  const s = (severity || '').toLowerCase();
  if (s === 'critical' || s === 'high') return 'var(--danger)';
  if (s === 'medium') return '#fbbf24';
  if (s === 'low') return '#3b82f6';
  return 'var(--text-muted)';
}

function getHealthColor(health: SitemapHealth): string {
  switch (health) {
    case 'pass': return 'var(--success)';
    case 'warning': return '#fbbf24';
    case 'fail': return 'var(--danger)';
    default: return 'var(--text-muted)';
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function KindBadge({ kind }: { kind: 'urlset' | 'sitemap_index' }) {
  const label = kind === 'sitemap_index' ? 'Index' : 'URL Set';
  const bg = kind === 'sitemap_index' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)';
  const color = kind === 'sitemap_index' ? '#a78bfa' : '#60a5fa';
  return (
    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: bg, color }}>
      {label}
    </span>
  );
}

function HealthBadge({ health }: { health: SitemapHealth }) {
  const color = getHealthColor(health);
  const label = health.charAt(0).toUpperCase() + health.slice(1);
  return (
    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: `${color}15`, color, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const color = getSeverityColor(severity);
  return (
    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: `${color}15`, color, border: `1px solid ${color}40` }}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: FindingStatus }) {
  const configs: Record<FindingStatus, { label: string; color: string; bg: string }> = {
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

function FindingRow({ finding, recommendation }: { finding: any; recommendation?: any }) {
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

function SitemapSummary({ summary, findings, recommendations, robots }: { 
  summary: any; 
  findings: any[]; 
  recommendations: any[];
  robots: any;
}) {
  const config = getStatusConfig(summary.status);

  return (
    <div style={{ padding: '20px', background: config.bg, border: `1px solid ${config.border}`, borderRadius: '12px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: '700' }}>
          {summary.status === 'pass' ? '✓' : summary.status === 'fail' ? '✗' : '⚠'}
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: config.color }}>{config.label}</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {summary.severity} severity
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <StatCard label="Sitemap Files" value={summary.sitemap_files} />
        <StatCard label="Page URLs" value={formatNumber(summary.page_urls)} />
        <StatCard label="Passed" value={summary.passed_checks} color="var(--success)" />
        <StatCard label="Warnings" value={summary.warning_count} color="#fbbf24" />
        <StatCard label="Failures" value={summary.failure_count} color="var(--danger)" />
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

      {findings.length > 0 && (
        <details style={{ marginTop: '16px' }}>
          <summary style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Findings ({findings.length})
          </summary>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {findings.map((finding, i) => (
              <FindingRow key={finding.code || i} finding={finding} recommendation={recommendations.find(r => r.code === finding.code)} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function SitemapFilesTable({ items, onRowClick, activeFile, checkId, onLoadUrls, onLoadRaw }: { 
  items: SitemapFilePageItem[];
  onRowClick: (file: SitemapFilePageItem) => void;
  activeFile: SitemapFilePageItem | null;
  checkId: string;
  onLoadUrls: (checkId: string, fileIndex: number) => void;
  onLoadRaw: (checkId: string, fileIndex: number) => void;
}) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Sitemap Files ({items.length})</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kind</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Health</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URLs</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Size</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Issues</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((file, i) => (
              <tr
                key={file.index}
                onClick={() => onRowClick(file)}
                style={{
                  cursor: 'pointer',
                  background: activeFile?.index === file.index ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (activeFile?.index !== file.index) e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                onMouseLeave={(e) => { if (activeFile?.index !== file.index) e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{file.index}</td>
                <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all', display: 'block' }} title={file.url}>
                    {file.url}
                  </a>
                </td>
                <td style={{ padding: '12px 16px' }}><KindBadge kind={file.kind} /></td>
                <td style={{ padding: '12px 16px' }}><HealthBadge health={file.health} /></td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: file.status_code ? (file.status_code >= 200 && file.status_code < 400 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
                  {file.status_code || '—'}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text)' }}>{formatNumber(file.url_count)}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{formatBytes(file.content_length)}</td>
                <td style={{ padding: '12px 16px' }}>
                  {file.issues.length > 0 ? (
                    <span style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {file.issues.map((issue: string, idx: number) => (
                        <span key={idx} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', textTransform: 'lowercase' }}>{issue}</span>
                      ))}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: '12px' }}>✓ Clean</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onLoadUrls(checkId, file.index); }}
                    style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '500', color: 'var(--primary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    View URLs
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onLoadRaw(checkId, file.index); }}
                    style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Raw XML
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SitemapUrlsPanel({ urlsPage, onLoadMore, hasMore }: { urlsPage: any; onLoadMore: () => void; hasMore: boolean }) {
  if (!urlsPage) return null;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>URLs from Sitemap</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            <a href={urlsPage.sitemap_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}>{urlsPage.sitemap_url}</a>
          </p>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing {urlsPage.items.length} of {urlsPage.total} URLs
        </div>
      </div>
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {urlsPage.items.map((url: string, i: number) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 20px',
                borderBottom: i < urlsPage.items.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: '13px',
                color: 'var(--primary)',
                textDecoration: 'none',
                display: 'block',
                wordBreak: 'break-all',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {url}
            </a>
          ))}
        </div>
        {hasMore && (
          <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={onLoadMore}
              style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '500', color: 'var(--primary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RawXmlPanel({ rawContent, onClose }: { rawContent: any; onClose: () => void }) {
  if (!rawContent) return null;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Raw XML</h3>
        <button type="button" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
      </div>
      <pre style={{ margin: 0, padding: '16px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px', lineHeight: 1.5, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(0,0,0,0.2)', maxHeight: '500px', overflow: 'auto' }}>
        {rawContent.raw_content}
      </pre>
    </div>
  );
}

export function SitemapTool({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');
  const {
    isLoading,
    error,
    result,
    filesPage,
    activeFile,
    urlsPage,
    rawContent,
    runCheck,
    loadUrls,
    loadRaw,
    setActiveFile,
    clearError,
    setRawContent,
  } = useSitemapCheck();

  const handleSubmit = useCallback(() => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    runCheck({ url: normalized });
  }, [url, runCheck]);

  const handleFileClick = useCallback((file: SitemapFilePageItem) => {
    setActiveFile(file);
    if (result) {
      loadUrls(result.check_id, file.index, 1);
    }
  }, [setActiveFile, result, loadUrls]);

  const handleLoadMoreUrls = useCallback(() => {
    if (result && activeFile && urlsPage?.has_next) {
      loadUrls(result.check_id, activeFile.index, urlsPage.page + 1);
    }
  }, [result, activeFile, urlsPage, loadUrls]);

  const handleViewRaw = useCallback((checkId: string, fileIndex: number) => {
    loadRaw(checkId, fileIndex);
  }, [loadRaw]);

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
        isLoading={isLoading}
        submitLabel={isLoading ? 'Analyzing...' : 'Analyze Sitemap'}
        inputPlaceholder="https://example.com"
      />

      {error && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={clearError} style={{ padding: '4px 12px', fontSize: '12px', color: '#fca5a5', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer' }}>Dismiss</button>
        </div>
      )}

      {result && (
        <SitemapSummary
          summary={result.summary}
          findings={result.findings}
          recommendations={result.recommendation_items}
          robots={result.robots}
        />
      )}

      {filesPage && (
        <SitemapFilesTable
          items={filesPage.items}
          onRowClick={handleFileClick}
          activeFile={activeFile}
          checkId={result!.check_id}
          onLoadUrls={loadUrls}
          onLoadRaw={handleViewRaw}
        />
      )}

      {activeFile && urlsPage && (
        <SitemapUrlsPanel
          urlsPage={urlsPage}
          onLoadMore={handleLoadMoreUrls}
          hasMore={urlsPage.has_next}
        />
      )}

      {rawContent && (
        <RawXmlPanel rawContent={rawContent} onClose={() => setRawContent(null)} />
      )}
    </ToolInputWrapper>
  );
}