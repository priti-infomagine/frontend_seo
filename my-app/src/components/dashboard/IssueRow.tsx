import type { Issue } from '../../types/audit';
import { getSeverityColor, getSeverityBgColor, getSeverityBorderColor, getSeverityLabel } from '../../utils/colors';
import { IssuePagesList } from './IssuePagesList';

interface IssueRowProps {
  issue: Issue;
  isExpanded: boolean;
  onToggle: () => void;
}

export function IssueRow({ issue, isExpanded, onToggle }: IssueRowProps) {
  const severityColor = getSeverityColor(issue.severity);
  const severityBg = getSeverityBgColor(issue.severity);
  const severityBorder = getSeverityBorderColor(issue.severity);

  return (
    <div
      className="issue-row"
      style={{
        border: `1px solid ${isExpanded ? severityBorder : 'var(--border)'}`,
        borderRadius: '10px',
        background: isExpanded ? severityBg : 'var(--card-bg)',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={isExpanded}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: severityColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '700',
            fontSize: '12px',
            flexShrink: 0,
            textTransform: 'uppercase',
          }}
        >
          {issue.severity.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{issue.title}</h4>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: severityBg,
                color: severityColor,
                border: `1px solid ${severityBorder}`,
              }}
            >
              {getSeverityLabel(issue.severity)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {issue.affected_pages} page{issue.affected_pages !== 1 ? 's' : ''} affected
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {issue.rule_id}
            </span>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>
            {issue.recommendation}
          </div>

          {issue.llm_tips && issue.llm_tips.length > 1 && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <strong style={{ color: 'var(--text)' }}>AI Tips:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {issue.llm_tips.map((tip, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {(issue.why || issue.what) && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {issue.why && <div><strong>Why:</strong> {issue.why}</div>}
              {issue.what && <div style={{ marginTop: '4px' }}><strong>What:</strong> {issue.what}</div>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <IssuePagesList pages={issue.pages ?? []} />
      )}
    </div>
  );
}