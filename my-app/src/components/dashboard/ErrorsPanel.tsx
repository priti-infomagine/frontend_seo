import type { AuditInfo } from '../../types/audit';

interface ErrorsPanelProps {
  audit: AuditInfo;
}

export function ErrorsPanel({ audit }: ErrorsPanelProps) {
  if (!audit.errors || audit.errors.length === 0) {
    return null;
  }

  return (
    <div className="errors-panel" style={{ marginBottom: '24px' }}>
      <div
        style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '600', color: 'var(--danger)' }}>
          <span>⚠</span>
          Crawl Errors ({audit.errors.length})
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5', fontSize: '14px', lineHeight: 2 }}>
          {audit.errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}