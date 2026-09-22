import { useEffect, useState } from 'react';
import type { AuditStatusResponse } from '../types/audit';
import { formatDuration } from '../utils/format';

interface ProgressScreenProps {
  statusData: AuditStatusResponse | null;
  onCancel: () => void;
  startedAt: string;
}

export function ProgressScreen({
  statusData,
  onCancel,
  startedAt,
}: ProgressScreenProps) {
  const [elapsedFormatted, setElapsedFormatted] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedFormatted(formatDuration(startedAt, new Date().toISOString()));
    }, 1000);
    setElapsedFormatted(formatDuration(startedAt, new Date().toISOString()));
    return () => clearInterval(interval);
  }, [startedAt]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--success)';
      case 'running': return 'var(--primary)';
      case 'pending': return 'var(--text-muted)';
      case 'failed': return 'var(--danger)';
      case 'error': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  const renderStatusBadge = (label: string, status: string | undefined) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '120px' }}>{label}</span>
      <span
        style={{
          padding: '4px 10px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'capitalize',
          background: `${getStatusColor(status || 'pending')}20`,
          color: getStatusColor(status || 'pending'),
          border: `1px solid ${getStatusColor(status || 'pending')}40`,
        }}
      >
        {status || 'pending'}
      </span>
    </div>
  );

  return (
    <div className="progress-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
        <div
          className="spinner"
          style={{
            width: '24px',
            height: '24px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ fontSize: '16px', fontWeight: '500' }}>Audit in progress...</span>
      </div>

      <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: 'var(--text)' }}>Elapsed:</strong> {elapsedFormatted}
        </div>
        {statusData?.audit_id && (
          <div>
            <strong style={{ color: 'var(--text)' }}>Audit ID:</strong>{' '}
            <code style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
              {statusData.audit_id.slice(0, 8)}...
            </code>
          </div>
        )}
      </div>

      {statusData && (
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pipeline Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            {renderStatusBadge('Parse', statusData.parse_status)}
            {renderStatusBadge('Evaluate', statusData.evaluate_status)}
            {renderStatusBadge('Score', statusData.score_status)}
          </div>
          
          {typeof statusData.pages_parsed === 'number' && typeof statusData.rules_evaluated === 'number' && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Progress
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>
                    {statusData.pages_parsed}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pages Parsed</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
                    {typeof statusData.rules_evaluated === 'number' ? statusData.rules_evaluated.toLocaleString() : '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rules Evaluated</div>
                </div>
              </div>
            </div>
          )}
          
          {statusData.overall_score !== undefined && statusData.grade && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)' }}>
                    {statusData.overall_score}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: 'var(--success)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                    }}
                  >
                    Grade {statusData.grade}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onCancel}
        style={{
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'inherit',
          color: 'var(--text)',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        Cancel & Return
      </button>
    </div>
  );
}