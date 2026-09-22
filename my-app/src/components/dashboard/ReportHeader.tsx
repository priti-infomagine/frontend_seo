import type { AuditInfo, Summary } from '../../types/audit';
import { formatDuration, formatTimestamp, formatScore } from '../../utils/format';
import { getStatusColor, getStatusBgColor, getStatusLabel } from '../../utils/colors';

interface ReportHeaderProps {
  audit: AuditInfo;
  summary: Summary;
}

export function ReportHeader({ audit, summary }: ReportHeaderProps) {
  const duration = formatDuration(audit.started_at, audit.completed_at);
  const startedAt = formatTimestamp(audit.started_at);
  const completedAt = formatTimestamp(audit.completed_at);

  return (
    <div className="report-header" style={{ marginBottom: '24px' }}>
      <div
        className="report-header-main"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '24px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          marginBottom: '16px',
        }}
      >
        <div
          className="score-gauge"
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            flexShrink: 0,
          }}
        >
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--border)"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={getStatusColor(summary.recommended_health)}
              strokeWidth="12"
              strokeDasharray={339.29}
               strokeDashoffset={339.29 - ((summary.recommended_score ?? 0) / 100) * 339.29}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1s ease-out',
                filter: 'drop-shadow(0 0 8px ' + getStatusColor(summary.recommended_health) + ')',
              }}
            />
             {summary.recommended_score !== null && summary.recommended_score > 0 && (
               <circle
                 cx="60"
                 cy="60"
                 r="46"
                 fill="none"
                 stroke="var(--text-muted)"
                 strokeWidth="2"
                 strokeDasharray="289"
                 strokeDashoffset={289 - ((summary.recommended_score ?? 0) / 100) * 289}
                strokeLinecap="round"
                style={{ opacity: 0.5 }}
              />
            )}
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: getStatusColor(summary.recommended_health),
                lineHeight: 1,
              }}
            >
              {formatScore(summary.recommended_score)}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '4px',
                textTransform: 'capitalize',
              }}
            >
              {getStatusLabel(summary.recommended_health)}
            </div>
          </div>
        </div>

        <div className="report-header-info" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                background: getStatusBgColor(summary.recommended_health),
                color: getStatusColor(summary.recommended_health),
                textTransform: 'capitalize',
              }}
            >
              {getStatusLabel(summary.recommended_health)}
            </div>
            {summary.recommended_score !== null && summary.recommended_score > 0 && (
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  background: 'rgba(148, 163, 184, 0.15)',
                  border: '1px solid var(--border)',
                }}
              >
                
              </div>
            )}
          </div>

          <div style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '8px', wordBreak: 'break-all' }}>
            <strong style={{ color: 'var(--text-muted)', marginRight: '8px' }}>URL:</strong>
            <a href={audit.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              {audit.url}
            </a>
          </div>

          <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <span>
              <strong style={{ color: 'var(--text)' }}>Domain:</strong> {audit.domain}
            </span>
             <span>
               <strong style={{ color: 'var(--text)' }}>Pages:</strong> {audit.pages?.discovered ?? '—'} discovered · {audit.pages?.crawled ?? '—'} crawled · {audit.pages?.analyzed ?? '—'} analyzed
             </span>
            <span>
              <strong style={{ color: 'var(--text)' }}>Duration:</strong> {duration}
            </span>
            <span>
              <strong style={{ color: 'var(--text)' }}>Started:</strong> {startedAt}
            </span>
            <span>
              <strong style={{ color: 'var(--text)' }}>Completed:</strong> {completedAt}
            </span>
          </div>
        </div>
      </div>

      {audit.errors && audit.errors.length > 0 && (
        <div
          className="report-header-errors"
          style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontWeight: '600', color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠</span> Crawl Errors
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5', fontSize: '14px' }}>
            {audit.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}