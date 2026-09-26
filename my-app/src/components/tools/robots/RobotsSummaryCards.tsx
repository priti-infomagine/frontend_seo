import React from 'react';
import type { RobotsCheckResponse, OverallStatus, SeverityLevel } from '../../../types/robots';

interface RobotsSummaryCardsProps {
  result: RobotsCheckResponse;
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

const getFetchStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return { label: 'SUCCESS', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)' };
    case 'not_found':
      return { label: 'NOT FOUND (404)', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' };
    case 'unreachable':
      return { label: 'UNREACHABLE', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' };
    default:
      return { label: status || 'UNKNOWN', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
  }
};

export const RobotsSummaryCards: React.FC<RobotsSummaryCardsProps> = ({ result }) => {
  const {
    domain,
    checked_at,
    exists,
    status_code,
    fetch_status,
    fetch_url,
    size_bytes,
    overall_status,
    severity,
    why,
    recommendation,
  } = result;

  const statusConfig = getStatusBadge(overall_status);
  const severityConfig = getSeverityBadge(severity);
  const fetchBadge = getFetchStatusBadge(fetch_status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner with Overall Status & Badges */}
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
          {checked_at && (
            <span>📅 {new Date(checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          )}
          <span>🌐 <strong style={{ color: 'var(--text)' }}>{domain}</strong></span>
        </div>
      </div>

      {/* Numerical & Core Attributes Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Exists Card */}
        <div
          style={{
            padding: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            File Status
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: exists ? '#4ade80' : '#f87171' }}>
            {exists ? '✓ Exists' : '✕ Not Found'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            HTTP {status_code || 0}
          </div>
        </div>

        {/* Fetch Status Card */}
        <div
          style={{
            padding: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            Fetch Outcome
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: fetchBadge.color }}>
            {fetchBadge.label}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
            {fetch_url ? (
              <a href={fetch_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                {fetch_url}
              </a>
            ) : '—'}
          </div>
        </div>

        {/* File Size Card */}
        <div
          style={{
            padding: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            Payload Size
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
            {size_bytes !== undefined ? `${size_bytes.toLocaleString()} B` : '—'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {size_bytes !== undefined ? `${(size_bytes / 1024).toFixed(2)} KB` : 'No payload'}
          </div>
        </div>
      </div>

      {/* "Why" Explanation Banner if present */}
      {why && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(37, 99, 235, 0.08)',
            borderLeft: '4px solid var(--primary)',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: 1.5,
            color: 'var(--text)',
          }}
        >
          <strong style={{ color: '#93c5fd', display: 'block', marginBottom: '4px' }}>
            Analysis Summary (Why):
          </strong>
          {why}
        </div>
      )}

      {/* Top-Level Recommendation Callout if present */}
      {recommendation && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(234, 179, 8, 0.08)',
            borderLeft: '4px solid #eab308',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: 1.5,
            color: 'var(--text)',
          }}
        >
          <strong style={{ color: '#fef08a', display: 'block', marginBottom: '4px' }}>
            Action Recommendation:
          </strong>
          {recommendation}
        </div>
      )}
    </div>
  );
};
