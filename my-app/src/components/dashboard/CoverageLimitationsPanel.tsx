import type { AuditInfo } from '../../types/audit';

interface CoverageLimitationsPanelProps {
  audit: AuditInfo;
}

export function CoverageLimitationsPanel({ audit }: CoverageLimitationsPanelProps) {
  if (!audit.external_dependencies || audit.external_dependencies.length === 0) {
    return null;
  }

  return (
    <div className="coverage-limitations-panel" style={{ marginBottom: '24px' }}>
      <div
        style={{
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '600', color: 'var(--primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          What This Report Doesn't Cover Yet
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
          This audit is based on crawl-based rule checks only. The following data sources are not currently included:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: 2 }}>
          {audit.external_dependencies.map((dep, i) => (
            <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <strong style={{ color: 'var(--text)', minWidth: '160px' }}>{dep.feature}:</strong>
              <span style={{ color: 'var(--text-muted)' }}>{dep.reason}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', marginBottom: 0 }}>
          Future integrations (Google Search Console, PageSpeed Insights, backlink APIs) will expand coverage.
        </p>
      </div>
    </div>
  );
}