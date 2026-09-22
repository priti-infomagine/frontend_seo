import type { StructuredIssue, SeverityLevel } from '../../types/audit';
import { getSeverityColor, getSeverityBorderColor } from '../../utils/colors';

interface SeveritySectionProps {
  severityKey: SeverityLevel;
  label: string;
  icon: string;
  issues: StructuredIssue[];
  expandedIssues: Set<string>;
  onToggleIssue: (ruleId: string) => void;
  expandedEvidencePages: Set<string>;
  onToggleEvidencePage: (key: string) => void;
  onOpenIssueDetail: (issue: StructuredIssue) => void;
}

export function SeveritySection({
  severityKey,
  label,
  icon,
  issues,
  expandedIssues,
  onToggleIssue,
  expandedEvidencePages,
  onToggleEvidencePage,
  onOpenIssueDetail,
}: SeveritySectionProps) {
  if (issues.length === 0) return null;

  const severityColor = getSeverityColor(severityKey);
  const severityBorder = getSeverityBorderColor(severityKey);

  return (
    <div style={{ border: `1px solid ${severityBorder}40`, borderRadius: '10px', overflow: 'hidden', background: `${severityColor}10` }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${severityColor}30`, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontWeight: '600', fontSize: '14px', color: severityColor }}>{label}</span>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase',
            background: `${severityColor}15`,
            color: severityColor,
            border: `1px solid ${severityColor}40`,
          }}
        >
          {issues.length}
        </span>
      </div>
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {issues.map((issue) => (
          <StructuredIssueAccordion
            key={issue.ruleId}
            issue={issue}
            isExpanded={expandedIssues.has(issue.ruleId)}
            onToggle={() => onToggleIssue(issue.ruleId)}
            expandedEvidencePages={expandedEvidencePages}
            onToggleEvidencePage={onToggleEvidencePage}
            onOpenIssueDetail={onOpenIssueDetail}
          />
        ))}
      </div>
    </div>
  );
}

import { StructuredIssueAccordion } from './StructuredIssueAccordion';