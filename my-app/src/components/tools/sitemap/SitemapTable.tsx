import React, { useState } from 'react';
import type { SitemapEntry, SitemapIssueItem, SitemapRecommendationItem } from '../../../types/sitemap';

interface SitemapTableProps {
  sitemaps: SitemapEntry[];
}

export const SitemapTable: React.FC<SitemapTableProps> = ({ sitemaps }) => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const expandAll = () => {
    const allExpanded = sitemaps.reduce((acc, _, i) => {
      acc[i] = true;
      return acc;
    }, {} as Record<number, boolean>);
    setExpandedRows(allExpanded);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  if (!sitemaps || sitemaps.length === 0) {
    return (
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <p style={{ margin: 0, fontSize: '15px' }}>No individual sitemap entries discovered.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(15, 23, 42, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Discovered Sitemaps ({sitemaps.length})
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={expandAll}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px', width: '32px' }}></th>
              <th style={{ padding: '12px 16px' }}>Sitemap URL</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px' }}>HTTP Status</th>
              <th style={{ padding: '12px 16px' }}>Content Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Declared Entries</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Response Time</th>
              <th style={{ padding: '12px 16px' }}>Status / Issues</th>
            </tr>
          </thead>
          <tbody>
            {sitemaps.map((item, idx) => {
              const isExpanded = !!expandedRows[idx];
              const issueCount = item.issues ? item.issues.length : 0;
              const hasIssuesOrError = Boolean(item.error || issueCount > 0 || (item.recommendations && item.recommendations.length > 0));

              return (
                <React.Fragment key={idx}>
                  <tr
                    onClick={() => toggleRow(idx)}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                        ▶
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: '500',
                            wordBreak: 'break-all',
                          }}
                          title={item.url}
                        >
                          {item.url}
                        </a>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: item.is_index ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: item.is_index ? '#c084fc' : '#60a5fa',
                          border: `1px solid ${item.is_index ? 'rgba(168, 85, 247, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                        }}
                      >
                        {item.is_index ? 'Sitemap Index' : 'URL Sitemap'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: item.status_code >= 200 && item.status_code < 300 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: item.status_code >= 200 && item.status_code < 300 ? '#4ade80' : '#f87171',
                        }}
                      >
                        {item.status_code || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                      {item.content_type || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: 'var(--text)' }}>
                      {(item.entry_count ?? 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {item.response_time_ms !== undefined ? `${item.response_time_ms}ms` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {item.error ? (
                        <span style={{ color: '#f87171', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ❌ Error
                        </span>
                      ) : issueCount > 0 ? (
                        <span style={{ color: '#fbbf24', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⚠️ {issueCount} issue{issueCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#4ade80', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ✓ Healthy
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Expandable Details Row */}
                  {isExpanded && (
                    <tr style={{ background: 'rgba(15, 23, 42, 0.7)', borderBottom: '1px solid var(--border)' }}>
                      <td colSpan={8} style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {/* Sitemap meta stats */}
                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <div><strong>Direct URL:</strong> <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{item.url}</a></div>
                            {item.content_length !== undefined && (
                              <div><strong>Size:</strong> {(item.content_length / 1024).toFixed(1)} KB ({item.content_length.toLocaleString()} bytes)</div>
                            )}
                            {item.response_time_ms !== undefined && (
                              <div><strong>Latency:</strong> {item.response_time_ms} ms</div>
                            )}
                          </div>

                          {/* Error block if any */}
                          {item.error && (
                            <div
                              style={{
                                padding: '12px 16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#fca5a5',
                                fontSize: '13px',
                              }}
                            >
                              <strong>Error:</strong> {item.error}
                            </div>
                          )}

                          {/* Issues specific to this sitemap */}
                          {item.issues && item.issues.length > 0 && (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#fbbf24', marginBottom: '8px' }}>
                                Issues in this sitemap ({item.issues.length}):
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {item.issues.map((issue, issueIdx) => (
                                  <SitemapIssueRow key={issueIdx} issue={issue} />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations specific to this sitemap */}
                          {item.recommendations && item.recommendations.length > 0 && (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#60a5fa', marginBottom: '8px' }}>
                                Recommendations for this sitemap ({item.recommendations.length}):
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {item.recommendations.map((rec, recIdx) => (
                                  <SitemapRecRow key={recIdx} rec={rec} />
                                ))}
                              </div>
                            </div>
                          )}

                          {!hasIssuesOrError && (
                            <div style={{ fontSize: '13px', color: '#4ade80' }}>
                              ✓ This sitemap parsed cleanly with no reported errors or structural anomalies.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SitemapIssueRow: React.FC<{ issue: SitemapIssueItem | string }> = ({ issue }) => {
  if (typeof issue === 'string') {
    return (
      <div style={{ padding: '8px 12px', background: 'rgba(234, 179, 8, 0.08)', borderRadius: '6px', fontSize: '12px', color: 'var(--text)' }}>
        • {issue}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '8px 12px',
        background: 'rgba(234, 179, 8, 0.08)',
        borderLeft: '3px solid #eab308',
        borderRadius: '4px',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: '600', color: '#fef08a' }}>{issue.type || issue.message || 'Issue'}</span>
        {issue.severity && (
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#facc15', fontWeight: '700' }}>
            {String(issue.severity)}
          </span>
        )}
      </div>
      {issue.description && <div style={{ color: 'var(--text-muted)' }}>{issue.description}</div>}
      {issue.details && <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{issue.details}</div>}
    </div>
  );
};

const SitemapRecRow: React.FC<{ rec: SitemapRecommendationItem | string }> = ({ rec }) => {
  if (typeof rec === 'string') {
    return (
      <div style={{ padding: '8px 12px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '6px', fontSize: '12px', color: 'var(--text)' }}>
        💡 {rec}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '8px 12px',
        background: 'rgba(59, 130, 246, 0.08)',
        borderLeft: '3px solid #3b82f6',
        borderRadius: '4px',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ fontWeight: '600', color: '#93c5fd' }}>{rec.title || 'Recommendation'}</div>
      {rec.description && <div style={{ color: 'var(--text-muted)' }}>{rec.description}</div>}
      {rec.action && <div style={{ color: 'var(--text)', fontWeight: '500' }}>Action: {rec.action}</div>}
    </div>
  );
};
