import type { AuditInfo, Summary } from '../../types/audit';
import { formatDuration, formatTimestamp, formatScore, formatNumberLocalized } from '../../utils/format';
import { getSeverityColor, getStatusColor, getStatusBgColor, getStatusLabel } from '../../utils/colors';

interface OverviewTabProps {
  audit: AuditInfo;
  summary: Summary;
}

export function OverviewTab({ audit, summary }: OverviewTabProps) {
  const duration = formatDuration(audit.started_at, audit.completed_at);
  const startedAt = formatTimestamp(audit.started_at);
  const completedAt = formatTimestamp(audit.completed_at);

  return (
    <div className="overview-tab" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Score Header */}
      <div
        className="overview-score-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '24px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
        }}
      >
        <div
          className="score-gauge"
          style={{
            position: 'relative',
            width: '140px',
            height: '140px',
            flexShrink: 0,
          }}
        >
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="var(--border)"
              strokeWidth="14"
            />
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke={getStatusColor(summary.recommended_health)}
              strokeWidth="14"
              strokeDasharray={389.56}
               strokeDashoffset={389.56 - ((summary.recommended_score ?? 0) / 100) * 389.56}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1s ease-out',
                filter: 'drop-shadow(0 0 12px ' + getStatusColor(summary.recommended_health) + ')',
              }}
            />
            {summary.recommended_score !== null && summary.recommended_score > 0 && (
              <circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeDasharray={339.3}
                strokeDashoffset={339.3 - ((summary.recommended_score ?? 0) / 100) * 339.3}
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
                fontSize: '42px',
                fontWeight: '700',
                color: getStatusColor(summary.recommended_health),
                lineHeight: 1,
              }}
            >
              {formatScore(summary.recommended_score)}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '4px',
                textTransform: 'capitalize',
              }}
            >
              {getStatusLabel(summary.recommended_health)}
            </div>
          </div>
        </div>

        <div className="overview-score-info" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '14px',
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
                  padding: '8px 16px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  background: 'rgba(148, 163, 184, 0.15)',
                  border: '1px solid var(--border)',
                }}
              >
               
              </div>
            )}
          </div>

          <div style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '12px', wordBreak: 'break-all' }}>
            <strong style={{ color: 'var(--text-muted)', marginRight: '8px' }}>URL:</strong>
            <a href={audit.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              {audit.url}
            </a>
          </div>

          <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <span><strong style={{ color: 'var(--text)' }}>Domain:</strong> {audit.domain}</span>
            <span><strong style={{ color: 'var(--text)' }}>Pages:</strong> {audit.pages?.discovered ?? '—'} discovered · {audit.pages?.crawled ?? '—'} crawled · {audit.pages?.analyzed ?? '—'} analyzed</span>
            <span><strong style={{ color: 'var(--text)' }}>Duration:</strong> {duration}</span>
            <span><strong style={{ color: 'var(--text)' }}>Started:</strong> {startedAt}</span>
            <span><strong style={{ color: 'var(--text)' }}>Completed:</strong> {completedAt}</span>
          </div>
        </div>
      </div>

      {/* Errors Panel */}
      {audit.errors && audit.errors.length > 0 && (
        <div
          className="overview-errors"
          style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontWeight: '600', color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠</span> Crawl Errors ({audit.errors.length})
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5', fontSize: '14px', lineHeight: 2 }}>
            {audit.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Severity Strip */}
      <div
        className="overview-severity"
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {[
          { key: 'critical', count: summary.issues.critical, label: 'Critical', color: getSeverityColor('critical') },
          { key: 'high', count: summary.issues.high, label: 'High', color: getSeverityColor('high') },
          { key: 'medium', count: summary.issues.medium, label: 'Medium', color: getSeverityColor('medium') },
          { key: 'low', count: summary.issues.low, label: 'Low', color: getSeverityColor('low') },
          { key: 'total', count: summary.issues.total, label: 'Total', color: 'var(--primary)' },
        ].map(({ key, count, label, color }) => (
          <div
            key={key}
            style={{
              flex: 1,
              minWidth: '100px',
              padding: '16px',
              background: `${color}15`,
              border: `1px solid ${color}40`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div style={{ fontWeight: '700', fontSize: '28px', lineHeight: 1, color }}>
              {count}
            </div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Checks Summary */}
      <div
        className="overview-checks"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: '600', color: 'var(--text)' }}>Rule Checks:</span>
          <span style={{ fontWeight: '700', color: 'var(--success)' }}>{summary.checks.passed}</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--text)' }}>{summary.checks.total}</span>
          <span style={{ color: 'var(--danger)' }}>{summary.checks.failed} failed</span>
        </div>
        <div style={{ flex: 1, maxWidth: '300px', height: '10px', background: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${summary.checks.total > 0 ? Math.round((summary.checks.passed / summary.checks.total) * 100) : 0}%`,
              height: '100%',
              background: summary.checks.passed === summary.checks.total ? 'var(--success)' : summary.checks.passed / summary.checks.total > 0.7 ? 'var(--primary)' : 'var(--danger)',
              borderRadius: '5px',
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
          {summary.checks.total > 0 ? Math.round((summary.checks.passed / summary.checks.total) * 100) : 0}%
        </span>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard label="Pages Crawled" value={audit.pages ? formatNumberLocalized(audit.pages.crawled) : '—'} icon="📄" />
        <StatCard label="Rules Evaluated" value={audit.meta?.rules_executed?.toLocaleString() || '—'} icon="⚙️" />
        <StatCard label="Total Issues" value={summary.issues.total} icon="⚠️" valueColor={summary.issues.total > 0 ? 'var(--danger)' : 'var(--success)'} />
        <StatCard label="Passed Checks" value={`${Math.round((summary.checks.total > 0 ? summary.checks.passed / summary.checks.total * 100 : 100))}%`} icon="✅" valueColor="var(--success)" />
      </div>

      {/* Coverage Limitations */}
      {audit.external_dependencies && audit.external_dependencies.length > 0 && (
        <div
          className="overview-limitations"
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
            What This Audit Doesn't Cover
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: 2 }}>
            {audit.external_dependencies.map((dep, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <strong style={{ color: 'var(--text)', minWidth: '160px' }}>{dep.feature}:</strong>
                <span style={{ color: 'var(--text-muted)' }}>{dep.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, valueColor = 'var(--text)' }: { label: string; value: string | number; icon: string; valueColor?: string }) {
  return (
    <div style={{ padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '700', color: valueColor }}>{value}</div>
    </div>
  );
}