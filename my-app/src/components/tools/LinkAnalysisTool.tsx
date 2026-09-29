import { useState, useCallback, useEffect } from 'react';
import { ToolInputForm, ToolInputWrapper } from './ToolCard';

const LINK_COLOR = '#ec4899';

type AnalysisStatus = 'idle' | 'submitting' | 'polling' | 'completed' | 'error';
type FindingCategory = 'standard' | 'optimization';
type FindingType =
  | 'broken_internal' | 'broken_external' | 'redirect_internal' | 'redirect_external'
  | 'orphan' | 'sitemap_url_error' | 'deep_page' | 'dead_end_page'
  | 'weakly_linked_page' | 'empty_anchor' | 'generic_anchor'
  | 'nofollow_internal' | 'insecure_link' | 'excessive_outlinks';
type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';
type OverallStatus = 'pass' | 'warning' | 'fail';

interface ProgressObject {
  phase: string;
  message: string;
  pages_crawled?: number;
  total_discovered?: number;
}

interface FindingSource {
  source_url: string;
  anchor_text: string;
  rel: string[];
}

interface FindingEvidence {
  sources: FindingSource[];
  total_sources: number;
  status_code: number | null;
  final_url?: string | null;
  incoming_count?: number;
  outgoing_internal?: number;
  sitemap_origin?: boolean;
  crawl_truncated?: boolean;
}

interface FindingRecommendation {
  title: string;
  priority: FindingSeverity;
  where_to_fix: string;
  action: string;
  fix_steps: string[];
}

interface Finding {
  category: FindingCategory;
  type: FindingType;
  severity: FindingSeverity;
  target_url: string;
  status_code: number | null;
  final_url: string | null;
  total_sources: number;
  sources: FindingSource[];
  recommendation: FindingRecommendation;
  evidence: FindingEvidence;
}

interface SummaryObject {
  pages_crawled: number;
  crawl_truncated: boolean;
  blocked_by_robots: number;
  internal_link_occurrences: number;
  unique_internal_targets: number;
  unique_external_targets: number;
  unverified_links: number;
  broken_links: number;
  counts_by_category: Record<string, number>;
  counts_by_type: Record<string, number>;
  counts_by_severity: Record<string, number>;
  total_issues: number;
  total_opportunities: number;
}

interface PageInfo {
  url: string;
  status_code: number;
  depth: number;
  inbound_internal_links: number;
  outbound_internal_links: number;
  outbound_external_links: number;
  is_orphan: boolean;
  is_dead_end: boolean;
  issues: string[];
}

interface LinkAnalysisCheckResponse {
  check_id: string;
  url: string;
  domain: string;
  status: string;
  task_id: string | null;
  progress: ProgressObject | null;
  error: string | null;
  checked_at: string | null;
  overall_status: OverallStatus | null;
  severity: FindingSeverity | null;
  cost_seconds: number | null;
  summary: SummaryObject | null;
  findings: Finding[];
  total_findings: number;
  pages: PageInfo[];
}

interface CheckResponse {
  check_id: string;
  task_id: string;
  url: string;
  domain: string;
  status: string;
  created_at: string | null;
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

function getSeverityColor(severity: FindingSeverity | null): string {
  if (!severity) return 'var(--text-muted)';
  switch (severity) {
    case 'critical': return 'var(--danger)';
    case 'high': return '#ef4444';
    case 'medium': return '#fbbf24';
    case 'low': return '#3b82f6';
    default: return 'var(--text-muted)';
  }
}

function getOverallStatusColor(status: OverallStatus | null): string {
  if (!status) return 'var(--text-muted)';
  switch (status) {
    case 'pass': return 'var(--success)';
    case 'warning': return '#fbbf24';
    case 'fail': return 'var(--danger)';
    default: return 'var(--text-muted)';
  }
}

function getOverallStatusBg(status: OverallStatus | null): string {
  if (!status) return 'rgba(148, 163, 184, 0.08)';
  switch (status) {
    case 'pass': return 'rgba(34, 197, 94, 0.1)';
    case 'warning': return 'rgba(251, 191, 36, 0.1)';
    case 'fail': return 'rgba(239, 68, 68, 0.1)';
    default: return 'rgba(148, 163, 184, 0.08)';
  }
}

function getOverallStatusBorder(status: OverallStatus | null): string {
  if (!status) return 'rgba(148, 163, 184, 0.2)';
  switch (status) {
    case 'pass': return 'rgba(34, 197, 94, 0.3)';
    case 'warning': return 'rgba(251, 191, 36, 0.3)';
    case 'fail': return 'rgba(239, 68, 68, 0.3)';
    default: return 'rgba(148, 163, 184, 0.2)';
  }
}

function getOverallStatusLabel(status: OverallStatus | null): string {
  if (!status) return 'Unknown';
  switch (status) {
    case 'pass': return 'All checks passed';
    case 'warning': return 'Minor issues detected';
    case 'fail': return 'Issues detected';
    default: return 'Unknown';
  }
}

function getOverallStatusIcon(status: OverallStatus | null): string {
  if (!status) return '−';
  switch (status) {
    case 'pass': return '✓';
    case 'warning': return '⚠';
    case 'fail': return '✗';
    default: return '−';
  }
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function getFindingTypeLabel(type: FindingType): string {
  const labels: Record<FindingType, string> = {
    broken_internal: 'Broken Internal Link',
    broken_external: 'Broken External Link',
    redirect_internal: 'Internal Redirect',
    redirect_external: 'External Redirect',
    orphan: 'Orphan Page',
    sitemap_url_error: 'Sitemap URL Error',
    deep_page: 'Deep Page',
    dead_end_page: 'Dead End Page',
    weakly_linked_page: 'Weakly Linked Page',
    empty_anchor: 'Empty Anchor Text',
    generic_anchor: 'Generic Anchor Text',
    nofollow_internal: 'NoFollow Internal Link',
    insecure_link: 'Insecure Link',
    excessive_outlinks: 'Excessive Outlinks',
  };
  return labels[type] || type;
}

function ProgressBar({ phase, message, percent }: { phase: string; message: string; percent: number }) {
  const phaseLabels: Record<string, string> = {
    queued: 'Job queued. Waiting for worker...',
    crawling: 'Crawling...',
    checking_links: 'Checking links...',
    analyzing: 'Analyzing findings...',
    completed: 'Completed',
  };

  const label = phaseLabels[phase] || message || 'Processing...';

  return (
    <div style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{percent}%</span>
      </div>
      <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
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
          }}
        />
      </div>
      {message && <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{message}</p>}
    </div>
  );
}

function StatsCard({ label, value, color = LINK_COLOR }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{ padding: '16px 20px', background: 'var(--card-bg)', border: `1px solid ${color}20`, borderRadius: '10px', textAlign: 'center', minWidth: '120px', flex: 1 }}>
      <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity | null }) {
  const color = getSeverityColor(severity);
  const label = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : '—';
  return (
    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: `${color}15`, color, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

function CategoryBadge({ category }: { category: FindingCategory }) {
  const color = category === 'standard' ? 'var(--danger)' : '#3b82f6';
  const bg = category === 'standard' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';
  return (
    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', background: bg, color }}>
      {category}
    </span>
  );
}

function FindingsTable({
  findings,
  totalFindings,
  currentPage,
  pageSize,
  onPageChange,
}: {
  findings: Finding[];
  totalFindings: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalFindings / pageSize);
  const safeTotalPages = totalPages > 0 ? totalPages : 1;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
          Findings ({totalFindings} total)
        </h3>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Page {currentPage} of {safeTotalPages}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target URL</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sources</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((finding, i) => (
              <tr key={`${finding.type}-${finding.target_url}-${i}`} style={{ borderBottom: i < findings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text)' }}>{getFindingTypeLabel(finding.type)}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <SeverityBadge severity={finding.severity} />
                </td>
                <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                  {finding.target_url && (
                    <a href={finding.target_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all', display: 'block', fontSize: '12px' }} title={finding.target_url}>
                      {finding.target_url}
                    </a>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <CategoryBadge category={finding.category} />
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  {finding.total_sources}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: finding.status_code ? (finding.status_code >= 200 && finding.status_code < 400 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
                  {finding.status_code || '—'}
                </td>
              </tr>
            ))}
            {findings.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No findings on this page
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {Array.from({ length: safeTotalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: pageNum === currentPage ? '600' : '400',
                color: pageNum === currentPage ? '#fff' : 'var(--text-muted)',
                background: pageNum === currentPage ? LINK_COLOR : 'transparent',
                border: `1px solid ${pageNum === currentPage ? LINK_COLOR : 'var(--border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PagesTable({ pages }: { pages: PageInfo[] }) {
  if (!pages.length) return null;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Pages Analyzed ({pages.length})</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Depth</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Internal In Links</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Internal Out Links</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>External Links</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Labels</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, i) => (
              <tr key={page.url} style={{ borderBottom: i < pages.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                  <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all', display: 'block', fontSize: '12px' }} title={page.url}>
                    {page.url}
                  </a>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: page.status_code >= 200 && page.status_code < 400 ? 'var(--success)' : 'var(--danger)' }}>
                  {page.status_code}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text)' }}>{page.depth}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text)' }}>{page.inbound_internal_links}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text)' }}>{page.outbound_internal_links}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text)' }}>{page.outbound_external_links}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {page.is_orphan && (
                      <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>Orphan</span>
                    )}
                    {page.is_dead_end && (
                      <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>Dead End</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LinkAnalysisResults({ response, currentPage, pageSize, onPageChange }: {
  response: LinkAnalysisCheckResponse;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const { summary, overall_status, severity, checked_at, cost_seconds, domain } = response;

  const statusColor = getOverallStatusColor(overall_status);
  const statusBg = getOverallStatusBg(overall_status);
  const statusBorder = getOverallStatusBorder(overall_status);
  const severityColor = getSeverityColor(severity);

  return (
    <>
      <div style={{ padding: '20px', background: statusBg, border: `1px solid ${statusBorder}`, borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: '700' }}>
            {getOverallStatusIcon(overall_status)}
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: statusColor }}>{getOverallStatusLabel(overall_status)}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Severity: <span style={{ color: severityColor, fontWeight: '600' }}>{severity}</span>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Domain: {domain}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Checked: {formatTimestamp(checked_at)}</span>
              {cost_seconds !== null && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration: {cost_seconds.toFixed(2)}s</span>}
            </div>
          </div>
        </div>

        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <StatsCard label="Pages Crawled" value={formatNumber(summary.pages_crawled)} />
            <StatsCard label="Broken Links" value={formatNumber(summary.broken_links)} color="var(--danger)" />
            <StatsCard label="Issues" value={formatNumber(summary.total_issues)} color="var(--danger)" />
            <StatsCard label="Opportunities" value={formatNumber(summary.total_opportunities)} color="#fbbf24" />
            <StatsCard label="Internal Targets" value={formatNumber(summary.unique_internal_targets)} />
            <StatsCard label="External Targets" value={formatNumber(summary.unique_external_targets)} />
            <StatsCard label="Link Occurrences" value={formatNumber(summary.internal_link_occurrences)} />
            <StatsCard label="Blocked by Robots" value={formatNumber(summary.blocked_by_robots)} />
          </div>
        )}

        {summary && (
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>Counts by Severity</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(summary.counts_by_severity).map(([sev, count]) => (
                <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getSeverityColor(sev as FindingSeverity) }} />
                  <span style={{ color: 'var(--text-muted)' }}>{sev}:</span>
                  <span style={{ color: 'var(--text)', fontWeight: '600' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {response.findings.length > 0 || (summary?.total_issues ?? 0) > 0 || (summary?.total_opportunities ?? 0) > 0 ? (
        <FindingsTable
          findings={response.findings}
          totalFindings={response.total_findings}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      ) : (
        <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
          <span style={{ color: 'var(--success)', fontWeight: '600' }}>No issues found. Your link profile looks good!</span>
        </div>
      )}

      {response.pages && response.pages.length > 0 && (
        <PagesTable pages={response.pages} />
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

  const [phase, setPhase] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checkId, setCheckId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ phase: string; message: string; percent: number } | null>(null);
  const [result, setResult] = useState<LinkAnalysisCheckResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  const startCheck = useCallback(async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    setPhase('submitting');
    setError(null);
    setCheckId(null);
    setProgress(null);
    setResult(null);
    setCurrentPage(1);

    try {
      const maxPagesNum = maxPages ? parseInt(maxPages, 10) : undefined;
      const body: { url: string; max_pages?: number } = { url: normalized };
      if (maxPagesNum !== undefined) {
        body.max_pages = maxPagesNum;
      }

      const res = await fetch('/api/v1/link-analysis/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: CheckResponse = await res.json();
      setCheckId(data.check_id);
      setPhase('polling');
      setProgress({ phase: 'queued', message: 'Job queued. Waiting for worker...', percent: 15 });
    } catch (err) {
      setPhase('error');
      setError(err instanceof Error ? err.message : 'Failed to start link analysis');
    }
  }, [url, maxPages]);

  const fetchCheck = useCallback(async (cid: string, page: number, size: number) => {
    try {
      const res = await fetch(`/api/v1/link-analysis/check/${cid}?page=${page}&page_size=${size}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Check not found. It may have expired.');
        }
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: LinkAnalysisCheckResponse = await res.json();
      setResult(data);

      if (data.status === 'queued' || data.status === 'processing') {
        setPhase('polling');
        if (data.progress) {
          let percent = 15;
          if (data.progress.phase === 'crawling') percent = 30;
          if (data.progress.phase === 'checking_links') percent = 50;
          if (data.progress.phase === 'analyzing') percent = 70;
          if (data.progress.total_discovered && data.progress.total_discovered > 0) {
            percent = Math.min(90, Math.round((data.progress.pages_crawled || 0) / data.progress.total_discovered * 100));
          }

          let message = data.progress.message;
          if (data.progress.phase === 'crawling' && data.progress.pages_crawled !== undefined) {
            message = `Crawling ${data.url || 'site'}... (${data.progress.pages_crawled} pages)`;
          }

          setProgress({ phase: data.progress.phase, message, percent });
        }
      } else if (data.status === 'completed') {
        setPhase('completed');
        setProgress(null);
      } else if (data.status === 'failed') {
        setPhase('error');
        setError(data.error || 'Link analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch check status');
      setPhase('error');
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    if (phase !== 'polling' || !checkId) return;

    const interval = setInterval(() => {
      fetchCheck(checkId, currentPage, pageSize);
    }, 2500);

    fetchCheck(checkId, currentPage, pageSize);

    return () => clearInterval(interval);
  }, [phase, checkId, currentPage, pageSize, fetchCheck]);

  const handleRetry = () => {
    setPhase('idle');
    setError(null);
    setCheckId(null);
    setProgress(null);
    setResult(null);
    setCurrentPage(1);
  };

  return (
    <ToolInputWrapper
      title="Link Analysis"
      desc="Analyze internal and external links, detect broken links, and identify redirect chains."
      onBack={onBack}
    >
      <ToolInputForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={startCheck}
        isLoading={phase === 'submitting' || phase === 'polling'}
        submitLabel={phase === 'polling' ? 'Analyzing...' : phase === 'submitting' ? 'Starting...' : 'Analyze Links'}
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
              placeholder="10"
              disabled={phase === 'submitting' || phase === 'polling'}
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
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span>{error}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleRetry} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '500', color: '#fff', background: 'var(--danger)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Retry</button>
            <button onClick={() => setError(null)} style={{ padding: '8px 16px', fontSize: '12px', color: '#fca5a5', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer' }}>Dismiss</button>
          </div>
        </div>
      )}

      {(phase === 'polling' || phase === 'submitting') && progress && (
        <ProgressBar phase={progress.phase} message={progress.message} percent={progress.percent} />
      )}

      {phase === 'completed' && result && (
        <LinkAnalysisResults
          response={result}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </ToolInputWrapper>
  );
}