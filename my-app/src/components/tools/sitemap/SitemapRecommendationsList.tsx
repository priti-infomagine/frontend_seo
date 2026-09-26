import React, { useState } from 'react';
import type { SitemapRecommendationItem } from '../../../types/sitemap';

interface SitemapRecommendationsListProps {
  recommendations: Array<SitemapRecommendationItem | string>;
}

export const SitemapRecommendationsList: React.FC<SitemapRecommendationsListProps> = ({ recommendations }) => {
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleRec = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAll = () => {
    const all = recommendations.reduce((acc, _, idx) => {
      acc[idx] = true;
      return acc;
    }, {} as Record<number, boolean>);
    setExpandedIndices(all);
  };

  const collapseAll = () => {
    setExpandedIndices({});
  };

  if (!recommendations || recommendations.length === 0) {
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
          <strong style={{ fontSize: '14px', display: 'block' }}>No Recommendations Needed</strong>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            All discovered sitemaps adhere to standard XML sitemap guidelines and best practices.
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
            <span>💡 Recommendations</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {recommendations.length}
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
          {recommendations.map((item, idx) => {
            const isExpanded = !!expandedIndices[idx];

            if (typeof item === 'string') {
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(59, 130, 246, 0.06)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text)',
                  }}
                >
                  {item}
                </div>
              );
            }

            const priority = item.priority?.toLowerCase() || 'medium';
            const priorityColor =
              priority === 'high' ? '#f87171' : priority === 'medium' ? '#fbbf24' : '#60a5fa';

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
                  onClick={() => toggleRec(idx)}
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
                      {item.title || item.description || `Recommendation #${idx + 1}`}
                    </span>
                  </div>

                  {item.priority && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: `${priorityColor}20`,
                        color: priorityColor,
                        border: `1px solid ${priorityColor}40`,
                      }}
                    >
                      {item.priority} Priority
                    </span>
                  )}
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
                    {item.action && (
                      <div
                        style={{
                          padding: '10px 12px',
                          background: 'rgba(37, 99, 235, 0.1)',
                          borderLeft: '3px solid var(--primary)',
                          borderRadius: '4px',
                          color: '#bfdbfe',
                          fontSize: '13px',
                        }}
                      >
                        <strong>Suggested Action: </strong>
                        {item.action}
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
