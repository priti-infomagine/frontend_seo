import type { StructuredIssue } from '../../types/audit';
import { getSeverityColor, getSeverityBgColor, getSeverityBorderColor } from '../../utils/colors';
import { IssueInformation } from './IssueInformation';
import { RecommendationSection } from './RecommendationSection';
import { EvidenceSection } from './EvidenceSection';

interface StructuredIssueAccordionProps {
  issue: StructuredIssue;
  isExpanded: boolean;
  onToggle: () => void;
  expandedEvidencePages: Set<string>;
  onToggleEvidencePage: (key: string) => void;
  onOpenIssueDetail: (issue: StructuredIssue) => void;
}

export function StructuredIssueAccordion({
  issue,
  isExpanded,
  onToggle,
  expandedEvidencePages,
  onToggleEvidencePage,
  onOpenIssueDetail,
}: StructuredIssueAccordionProps) {
  const severityColor = getSeverityColor(issue.severity);
  const severityBg = getSeverityBgColor(issue.severity);
  const severityBorder = getSeverityBorderColor(issue.severity);

  return (
    <div
      className="structured-issue-accordion"
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
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{issue.issue.title}</h4>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: severityBg,
                color: severityColor,
                border: `1px solid ${severityBorder}`,
              }}
            >
              {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1).toLowerCase()}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {issue.evidence.affectedPages} page{issue.evidence.affectedPages !== 1 ? 's' : ''} affected
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {issue.ruleId}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {issue.recommendation.text || 'No recommendation available.'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenIssueDetail(issue); }}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: '500',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            View Details
          </button>
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
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px' }}>
            <IssueInformation issue={issue.issue} />
            <RecommendationSection recommendation={issue.recommendation} />
            <EvidenceSection
              evidence={issue.evidence}
              expandedEvidencePages={expandedEvidencePages}
              onToggleEvidencePage={onToggleEvidencePage}
              ruleId={issue.ruleId}
            />
          </div>
        </div>
      )}
    </div>
  );
}