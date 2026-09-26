import React from 'react';
import type { SitemapResultResponse, OverallStatus, SeverityLevel } from '../../../types/sitemap';

interface SitemapSummaryCardsProps {
  result: SitemapResultResponse;
}

const getStatusBadge = (status: OverallStatus) => {
  switch (status) {
    case 'pass':
      return { label: 'PASS', bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', color: '#4ade80', icon: '✓' };
    case 'warning':
      return { label: 'WARNING', bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', color: '#facc15', icon: '⚠' };
    case 'fail':
      return { label: 'FAIL', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#f87171', icon: '✕' };
    case 'not_applicable':
    default:
      return { label: 'N/A', bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', color: '#94a3b8', icon: '—' };
  }
};

const getSeverityBadge = (severity: SeverityLevel) => {
  switch (severity) {
    case 'critical':
      return { label: 'CRITICAL', bg: 'rgba(225, 29, 72, 0.2)', border: '#e11d48', color: '#fb7185' };
    case 'high':
      return { label: 'HIGH', bg: 'rgba(239, 68, 68, 0.18)', border: '#ef4444', color: '#f87171' };
    case 'medium':
      return { label: 'MEDIUM', bg: 'rgba(245, 158, 11, 0.18)', border: '#f59e0b', color: '#fbbf24' };
    case 'low':
      return { label: 'LOW', bg: 'rgba(59, 130, 246, 0.18)', border: '#3b82f6', color: '#60a5fa' };
    case 'none':
    default:
      return { label: 'NONE', bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', color: '#4ade80' };
  }
};

export const SitemapSummaryCards: React.FC<SitemapSummaryCardsProps> = ({ result }) => {
  const { summary, overall_status = 'pass', severity = 'none', cost_seconds, checked_at } = result;
  const statusConfig = getStatusBadge(overall_status);
  const severityConfig = getSeverityBadge(severity);

  const totalSitemaps = summary?.total_sitemaps ?? 0;
  const sitemapIndexes = summary?.sitemap_indexes ?? 0;
  const urlSitemaps = summary?.url_sitemaps ?? 0;
  const totalUrls = summary?.total_urls_declared ?? 0;
  const totalIssues = summary?.total_issues ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner with Overall Status, Severity, and Time */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
              color: statusConfig.color,
              fontWeight: '700',
              fontSize: '13px',
              letterSpacing: '0.5px',
            }}
          >
            <span>{statusConfig.icon}</span>
            <span>Overall: {statusConfig.label}</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: severityConfig.bg,
              border: `1px solid ${severityConfig.border}`,
              color: severityConfig.color,
              fontWeight: '700',
              fontSize: '13px',
              letterSpacing: '0.5px',
            }}
          >
            <span>Severity: {severityConfig.label}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {cost_seconds !== undefined && (
            <span>⏱️ <strong>{cost_seconds.toFixed(2)}s</strong> scan time</span>
          )}
          {checked_at && (
            <span>📅 {new Date(checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          )}
        </div>
      </div>

      {/* Grid of Key Numerical Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
        }}
      >
        <MetricCard
          label="Total Sitemaps"
          value={totalSitemaps}
          subtext={`${sitemapIndexes} index, ${urlSitemaps} url`}
          color="var(--primary)"
          icon="🗺️"
        />
        <MetricCard
          label="Declared URLs"
          value={totalUrls.toLocaleString()}
          subtext="Total <loc> entries found"
          color="#38bdf8"
          icon="🔗"
        />
        <MetricCard
          label="Total Issues"
          value={totalIssues}
          subtext={totalIssues === 0 ? 'Clean sitemap structure' : 'Requires attention'}
          color={totalIssues > 0 ? '#f87171' : '#4ade80'}
          icon={totalIssues > 0 ? '⚠️' : '✅'}
        />
        <MetricCard
          label="Sitemap Indexes"
          value={sitemapIndexes}
          subtext="Nested sitemap indexes"
          color="#a78bfa"
          icon="📑"
        />
      </div>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, color, icon }) => (
  <div
    style={{
      padding: '16px',
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
        {label}
      </span>
      <span style={{ fontSize: '16px' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
    {subtext && (
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtext}</div>
    )}
  </div>
);
