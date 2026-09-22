import type { Summary } from '../../types/audit';

interface ChecksSummaryProps {
  summary: Summary;
}

export function ChecksSummary({ summary }: ChecksSummaryProps) {
  const { passed, failed, total } = summary.checks;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div
      className="checks-summary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
        <span style={{ fontWeight: '600', color: 'var(--text)' }}>Checks:</span>
        <span>{passed}/{total} passed</span>
        <span style={{ color: 'var(--danger)' }}>{failed} failed</span>
      </div>
      <div style={{ flex: 1, maxWidth: '300px', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${passRate}%`,
            height: '100%',
            background: passed === total ? 'var(--success)' : passRate >= 70 ? 'var(--primary)' : 'var(--danger)',
            borderRadius: '4px',
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
        {passRate}%
      </span>
    </div>
  );
}