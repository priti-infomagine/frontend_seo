import React, { useState } from 'react';
import type { SitemapFindingItem } from '../../../types/sitemap';

interface SitemapFindingsListProps {
  findings: Array<SitemapFindingItem | string>;
}

export const SitemapFindingsList: React.FC<SitemapFindingsListProps> = ({ findings }) => {
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleFinding = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAll = () => {
    const all = findings.reduce((acc, _, idx) => {
      acc[idx] = true;
      return acc;
    }, {} as Record<number, boolean>);
    setExpandedIndices(all);
  };

  const collapseAll = () => {
    setExpandedIndices({});
  };

  if (!findings || findings.length === 0) {
    return (
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#4ade80',
        }}
      >
        <span style={{ fontSize: '20px' }}></span>
        <div>
          <strong style={{ fontSize: '14px', display: 'block' }}>No Top-Level Findings</strong>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            No critical or high severity issues were detected in this sitemap audit.
          </span>
        </div>
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
      {/* Accordion Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.4)',
          borderBottom: isSectionOpen ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsSectionOpen(!isSectionOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-block',
              transform: isSectionOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            ▶
          </span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍 Findings</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {findings.length}
            </span>
          </h3>
        </div>

        {isSectionOpen && (
          <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
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
        )}
      </div>

      {/* Accordion Body */}
      {isSectionOpen && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {findings.map((item, idx) => {
            const isExpanded = !!expandedIndices[idx];

            if (typeof item === 'string') {
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text)',
                  }}
                >
                  {item}
                </div>
              );
            }

            const severity = item.severity?.toLowerCase() || 'medium';
            const severityColor =
              severity === 'critical'
                ? '#f43f5e'
                : severity === 'high'
                ? '#f87171'
                : severity === 'medium'
                ? '#fbbf24'
                : '#60a5fa';

            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.3)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                <div
                  onClick={() => toggleFinding(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                      }}
                    >
                      ▶
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text)' }}>
                      {item.title || item.description || `Finding #${idx + 1}`}
                    </span>
                    {item.category && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: `${severityColor}20`,
                      color: severityColor,
                      border: `1px solid ${severityColor}40`,
                    }}
                  >
                    {item.severity || 'Issue'}
                  </span>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: '12px 16px 16px 36px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {item.description && item.title && (
                      <div style={{ color: 'var(--text)', lineHeight: 1.5 }}>{item.description}</div>
                    )}
                    {item.impact && (
                      <div>
                        <strong style={{ color: '#fbbf24' }}>Impact: </strong>
                        <span>{item.impact}</span>
                      </div>
                    )}
                    {item.urls && item.urls.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        <strong style={{ color: 'var(--text)' }}>Impacted URLs ({item.urls.length}):</strong>
                        <div
                          style={{
                            marginTop: '6px',
                            maxHeight: '120px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            padding: '8px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '6px',
                          }}
                        >
                          {item.urls.map((u, uIdx) => (
                            <a
                              key={uIdx}
                              href={u}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--primary)', fontSize: '12px', textDecoration: 'none', wordBreak: 'break-all' }}
                            >
                              {u}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
