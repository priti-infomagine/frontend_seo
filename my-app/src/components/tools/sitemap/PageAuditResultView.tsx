import React, { useState, useMemo } from 'react';
import type { PageAuditResult } from '../../../types/sitemap';

interface PageAuditResultViewProps {
  pageAudits: PageAuditResult[];
}

const getScoreColor = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return '#94a3b8';
  if (score >= 90) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

const getScoreBadge = (score: number | null | undefined, mode?: string) => {
  if (mode === 'error') {
    return { label: 'ERROR', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
  }
  if (score === null || score === undefined) {
    return { label: 'N/A', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)' };
  }
  if (score === 100) {
    return { label: 'PASSED (100)', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
  }
  if (score >= 90) {
    return { label: `${score}/100`, color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
  }
  if (score >= 50) {
    return { label: `${score}/100`, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
  }
  return { label: `${score}/100`, color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
};

const getMetricColor = (metric: 'fcp' | 'lcp' | 'tbt' | 'cls', value: number | null | undefined): string => {
  if (value === null || value === undefined) return '#94a3b8';
  switch (metric) {
    case 'fcp':
      return value <= 1800 ? '#22c55e' : value <= 3000 ? '#f59e0b' : '#ef4444';
    case 'lcp':
      return value <= 2500 ? '#22c55e' : value <= 4000 ? '#f59e0b' : '#ef4444';
    case 'tbt':
      return value <= 200 ? '#22c55e' : value <= 600 ? '#f59e0b' : '#ef4444';
    case 'cls':
      return value <= 0.1 ? '#22c55e' : value <= 0.25 ? '#f59e0b' : '#ef4444';
  }
};

/** Render markdown links in descriptions into clickable anchors */
function renderMarkdownLinks(text: string) {
  if (!text) return null;
  const parts: (string | React.ReactNode)[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--primary)', textDecoration: 'underline' }}
        onClick={(e) => e.stopPropagation()}
      >
        {linkText}
      </a>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export const PageAuditResultView: React.FC<PageAuditResultViewProps> = ({ pageAudits }) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issues' | 'passed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAudits, setExpandedAudits] = useState<Record<string, boolean>>({});

  const currentPage = pageAudits[selectedPageIndex] || pageAudits[0];

  const categories = useMemo(() => {
    if (!currentPage || !currentPage.recommendations) return ['all'];
    const cats = new Set<string>();
    currentPage.recommendations.forEach((r) => {
      if (r.category) cats.add(r.category);
    });
    return ['all', ...Array.from(cats)];
  }, [currentPage]);

  const filteredRecommendations = useMemo(() => {
    if (!currentPage || !currentPage.recommendations) return [];

    return currentPage.recommendations.filter((rec) => {
      // Category filter
      if (selectedCategory !== 'all' && rec.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Status filter
      if (statusFilter === 'issues') {
        const isIssue = (rec.score !== null && rec.score !== undefined && rec.score < 90) || rec.score_display_mode === 'error';
        if (!isIssue) return false;
      } else if (statusFilter === 'passed') {
        if (rec.score !== 100) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = rec.title?.toLowerCase().includes(q);
        const matchesId = rec.audit_id?.toLowerCase().includes(q);
        const matchesDesc = rec.description?.toLowerCase().includes(q);
        const matchesRec = rec.recommendation?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesDesc && !matchesRec) return false;
      }

      return true;
    });
  }, [currentPage, selectedCategory, statusFilter, searchQuery]);

  const toggleAudit = (auditId: string) => {
    setExpandedAudits((prev) => ({
      ...prev,
      [auditId]: !prev[auditId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    filteredRecommendations.forEach((r) => {
      all[r.audit_id] = true;
    });
    setExpandedAudits(all);
  };

  const collapseAll = () => {
    setExpandedAudits({});
  };

  if (!pageAudits || pageAudits.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No page audits available.
      </div>
    );
  }

  const {
    url,
    device,
    status,
    performance_score,
    seo_score,
    fcp_ms,
    lcp_ms,
    tbt_ms,
    cls,
    recommendations = [],
  } = currentPage;

  const totalAudits = recommendations.length;
  const issueCount = recommendations.filter((r) => (r.score !== null && r.score !== undefined && r.score < 90) || r.score_display_mode === 'error').length;
  const passedCount = recommendations.filter((r) => r.score === 100).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Tabs if multiple pages audited */}
      {pageAudits.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {pageAudits.map((page, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedPageIndex(idx);
                setExpandedAudits({});
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: selectedPageIndex === idx ? 'var(--primary)' : 'var(--card-bg)',
                color: selectedPageIndex === idx ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${selectedPageIndex === idx ? 'var(--primary)' : 'var(--border)'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Page {idx + 1}: {page.url}
            </button>
          ))}
        </div>
      )}

      {/* 1. Page Header Card with Gauges & URL */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Top URL and Device Meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '20px' }}>🌐</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}
            >
              {url}
            </a>
            {device && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                📱 {device}
              </span>
            )}
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '6px',
                background: status === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: status === 'success' ? '#4ade80' : '#f87171',
                border: `1px solid ${status === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              {status || 'Completed'}
            </span>
          </div>
        </div>

        {/* Scores & Core Web Vitals Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {/* Lighthouse Score Gauges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            }}
          >
            <ScoreGauge score={performance_score ?? null} label="Performance" />
            <ScoreGauge score={seo_score ?? null} label="SEO Score" />
          </div>

          {/* Core Web Vitals Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            <MetricCard label="First Contentful Paint" value={fcp_ms !== null && fcp_ms !== undefined ? `${fcp_ms} ms` : '—'} color={getMetricColor('fcp', fcp_ms)} subtext="Good <= 1.8s" />
            <MetricCard label="Largest Contentful Paint" value={lcp_ms !== null && lcp_ms !== undefined ? `${lcp_ms} ms` : '—'} color={getMetricColor('lcp', lcp_ms)} subtext="Good <= 2.5s" />
            <MetricCard label="Total Blocking Time" value={tbt_ms !== null && tbt_ms !== undefined ? `${tbt_ms} ms` : '0 ms'} color={getMetricColor('tbt', tbt_ms)} subtext="Good <= 200ms" />
            <MetricCard label="Cumulative Layout Shift" value={cls !== null && cls !== undefined ? cls.toFixed(3) : '0.000'} color={getMetricColor('cls', cls)} subtext="Good <= 0.1" />
          </div>
        </div>
      </div>

      {/* 2. Audit Filter & Search Toolbar */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Category Filter Pills & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat === 'all' ? `All Categories (${totalAudits})` : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Filter audits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                background: '#0b1220',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Status filter bar (All / Issues / Passed) and Expand All / Collapse All */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                background: statusFilter === 'all' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: statusFilter === 'all' ? 'var(--text)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              All ({totalAudits})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('issues')}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                background: statusFilter === 'issues' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: statusFilter === 'issues' ? '#f87171' : '#fb7185',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ⚠️ Opportunities & Issues ({issueCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('passed')}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                background: statusFilter === 'passed' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                color: statusFilter === 'passed' ? '#4ade80' : '#86efac',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✓ Passed Audits ({passedCount})
            </button>
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
      </div>

      {/* 3. Foldable / Expandable Audits List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredRecommendations.length === 0 ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-muted)',
            }}
          >
            No audits match the selected filters.
          </div>
        ) : (
          filteredRecommendations.map((rec) => {
            const isExpanded = !!expandedAudits[rec.audit_id];
            const badge = getScoreBadge(rec.score, rec.score_display_mode);

            return (
              <div
                key={rec.audit_id}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Collapsible Header */}
                <div
                  onClick={() => toggleAudit(rec.audit_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: '12px',
                    background: isExpanded ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
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

                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                      {rec.title}
                    </span>

                    {rec.category && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {rec.category}
                      </span>
                    )}

                    {rec.display_value && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#fbbf24',
                          fontWeight: '600',
                          background: 'rgba(245, 158, 11, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                        }}
                      >
                        ⚡ {rec.display_value}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '16px 20px 20px 42px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      background: 'rgba(11, 18, 32, 0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      fontSize: '13px',
                    }}
                  >
                    {/* Description with rendered markdown links */}
                    {rec.description && (
                      <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                        {renderMarkdownLinks(rec.description)}
                      </div>
                    )}

                    {/* Actionable Recommendation Alert */}
                    {rec.recommendation && (
                      <div
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(37, 99, 235, 0.08)',
                          borderLeft: '4px solid var(--primary)',
                          borderRadius: '6px',
                          color: '#bfdbfe',
                          lineHeight: 1.5,
                        }}
                      >
                        <strong style={{ color: '#93c5fd', display: 'block', marginBottom: '2px' }}>
                          Action Recommendation:
                        </strong>
                        {rec.recommendation}
                      </div>
                    )}

                    {/* Where to fix location */}
                    {rec.where_to_fix && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ color: 'var(--text-muted)' }}>Location / Target:</strong>
                        {rec.where_to_fix.startsWith('http') ? (
                          <a
                            href={rec.where_to_fix}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}
                          >
                            {rec.where_to_fix}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{rec.where_to_fix}</span>
                        )}
                      </div>
                    )}

                    {/* Evidence List / Table */}
                    {rec.evidence && rec.evidence.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <strong style={{ color: 'var(--text)' }}>
                          Evidence Assets ({rec.evidence.length}):
                        </strong>
                        <div
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            maxHeight: '160px',
                            overflowY: 'auto',
                          }}
                        >
                          {rec.evidence.map((ev, evIdx) => (
                            <div key={evIdx} style={{ fontSize: '12px', color: '#e2e8f0', wordBreak: 'break-all' }}>
                              {ev.url ? (
                                <a href={ev.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                                  {ev.url}
                                </a>
                              ) : (
                                JSON.stringify(ev)
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error message or Warnings */}
                    {rec.error_message && (
                      <div
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          color: '#fca5a5',
                        }}
                      >
                        <strong>Audit Warning/Error: </strong>
                        {rec.error_message}
                      </div>
                    )}

                    {/* Audit meta info footer */}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Audit ID: <code style={{ color: 'var(--text)' }}>{rec.audit_id}</code></span>
                      {rec.category_weight !== undefined && <span>Weight: {rec.category_weight}</span>}
                      {rec.score_display_mode && <span>Mode: {rec.score_display_mode}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

function ScoreGauge({ score, label, size = 90 }: { score: number | null; label: string; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? Math.max(0, Math.min(100, score)) / 100 : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const color = getScoreColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={7}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: '800',
            color: color,
          }}
        >
          {score !== null ? score : '—'}
        </div>
      </div>
      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
    </div>
  );
}

function MetricCard({ label, value, color, subtext }: { label: string; value: string; color: string; subtext: string }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
        {label}
      </span>
      <span style={{ fontSize: '18px', fontWeight: '700', color, fontFamily: 'monospace' }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subtext}</span>
    </div>
  );
}
