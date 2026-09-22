import { useState } from 'react';
import type { Issue, IssuePage } from '../../types/audit';
import { getSeverityColor, getSeverityBgColor, getSeverityBorderColor, getSeverityLabel } from '../../utils/colors';
import { PaginatedList } from '../common/PaginatedList';

interface IssueDetailPanelProps {
  issue: Issue | null;
  onClose: () => void;
}

export function IssueDetailPanel({ issue, onClose }: IssueDetailPanelProps) {
  if (!issue) return null;

  const severityColor = getSeverityColor(issue.severity);
  const severityBg = getSeverityBgColor(issue.severity);
  const severityBorder = getSeverityBorderColor(issue.severity);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'recommendation' | 'evidence' | 'pages'>('details');

  const pages = issue.pages ?? [];

  return (
    <div
      className="issue-detail-panel"
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '520px',
        maxWidth: '100vw',
        background: 'var(--card-bg)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: severityColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '700',
            fontSize: '13px',
            flexShrink: 0,
            textTransform: 'uppercase',
          }}
        >
          {issue.severity.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{issue.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: severityBg,
                color: severityColor,
                border: `1px solid ${severityBorder}`,
              }}
            >
              {getSeverityLabel(issue.severity)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {issue.rule_id}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {issue.affected_pages ?? 0} page{(issue.affected_pages ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '8px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: '8px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
        {[
          { id: 'details', label: 'Details', icon: '📋' },
          { id: 'recommendation', label: 'Recommendation', icon: '💡' },
          { id: 'evidence', label: 'Evidence', icon: '🔍' },
          { id: 'pages', label: 'Pages', icon: '📄' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === tab.id ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: collapsed ? 'none' : 'block' }}>
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Description
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                {issue.what || issue.why || issue.recommendation || 'No description available.'}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                What Was Found
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {issue.what || 'No specific details available.'}
              </p>
            </div>

            {issue.llm_tips && issue.llm_tips.length > 0 && (
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  AI Insights
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text)', lineHeight: 1.8 }}>
                  {issue.llm_tips.map((tip, i) => (
                    <li key={i} style={{ fontSize: '13px' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Recommended Fix
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                {issue.recommendation || 'No recommendation available.'}
              </p>
            </div>

            {issue.llm_tips && issue.llm_tips.length > 1 && (
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Additional Tips
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text)', lineHeight: 1.8 }}>
                  {issue.llm_tips.slice(1).map((tip, i) => (
                    <li key={i} style={{ fontSize: '13px', marginBottom: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Evidence Data
            </h4>
            {pages.length > 0 && pages.some(p => p.evidence && Object.keys(p.evidence).length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pages
                  .filter(p => p.evidence && Object.keys(p.evidence).length > 0)
                  .map((page, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '500', color: 'var(--primary)', background: 'rgba(37, 99, 235, 0.08)', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {page.page_url}
                      </div>
                      <div style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', maxHeight: '300px', overflow: 'auto' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {JSON.stringify(page.evidence, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : pages.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.5 }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>No pages were found for this issue.</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>This may indicate that the issue is not present on any crawled pages.</p>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.5 }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>No evidence data available for this issue.</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Evidence is only shown when specific data was captured during the audit.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pages' && (
          <IssuePagesList pages={pages} />
        )}
      </div>

      {collapsed && (
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid var(--border)',
            background: 'rgba(37, 99, 235, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--primary)',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onClick={() => setCollapsed(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          Click to expand
        </div>
      )}
    </div>
  );
}

interface IssuePagesListProps {
  pages: IssuePage[];
}

function IssuePagesList({ pages }: IssuePagesListProps) {
  const renderPage = (page: IssuePage, index: number) => (
    <div
      style={{
        padding: '12px 16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <a
          href={page.page_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '13px',
            color: 'var(--primary)',
            textDecoration: 'none',
            wordBreak: 'break-all',
            flex: 1,
            minWidth: 0,
          }}
          title={page.page_url}
        >
          {page.page_url}
        </a>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          #{index + 1}
        </span>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text)', paddingLeft: '4px' }}>
        <strong style={{ color: 'var(--text-muted)' }}>Found:</strong> {page.current_value}
      </div>

      {page.evidence && Object.keys(page.evidence).length > 0 && (
        <details style={{ marginTop: '4px' }}>
          <summary style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 0' }}>
            Evidence ({Object.keys(page.evidence).length})
          </summary>
          <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(page.evidence, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {page.classified_images && page.classified_images.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Classified Images ({page.classified_images.length})
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {page.classified_images.slice(0, 6).map((img, i) => (
              <div key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '2px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                {JSON.stringify(img).slice(0, 50)}...
              </div>
            ))}
            {page.classified_images.length > 6 && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '2px' }}>
                +{page.classified_images.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="issue-pages-list" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
          Affected Pages ({pages.length})
        </h5>
      </div>
      <PaginatedList
        items={pages}
        renderItem={renderPage}
        itemsPerPage={10}
        pageSizeOptions={[10, 20, 50]}
        showPageSizeSelector={true}
      />
    </div>
  );
}
