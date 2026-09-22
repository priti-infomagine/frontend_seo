import type { GroupedCategory, SeverityLevel, StructuredIssue } from '../../types/audit';
import { getStatusColor, getStatusBgColor, getStatusBorderColor, getStatusLabel } from '../../utils/colors';
import { SeveritySection } from './SeveritySection';

interface IssueCategoryAccordionProps {
  category: GroupedCategory;
  isExpanded: boolean;
  onToggle: () => void;
  expandedIssues: Set<string>;
  onToggleIssue: (ruleId: string) => void;
  expandedEvidencePages: Set<string>;
  onToggleEvidencePage: (key: string) => void;
  onOpenIssueDetail: (issue: StructuredIssue) => void;
}

const SEVERITY_ORDER: { key: SeverityLevel; label: string; icon: string }[] = [
  { key: 'critical', label: 'Critical', icon: '🔴' },
  { key: 'high', label: 'High', icon: '🟠' },
  { key: 'medium', label: 'Medium', icon: '🟡' },
  { key: 'low', label: 'Low', icon: '🔵' },
  { key: 'other', label: 'Other', icon: '⚪' },
];

export function IssueCategoryAccordion({
  category,
  isExpanded,
  onToggle,
  expandedIssues,
  onToggleIssue,
  expandedEvidencePages,
  onToggleEvidencePage,
  onOpenIssueDetail,
}: IssueCategoryAccordionProps) {
  const statusColor = getStatusColor(category.status);
  const statusBg = getStatusBgColor(category.status);
  const statusBorder = getStatusBorderColor(category.status);

  return (
    <div
      className="issue-category-accordion"
      style={{
        border: `1px solid ${isExpanded ? statusBorder : 'var(--border)'}`,
        borderRadius: '12px',
        background: isExpanded ? statusBg : 'var(--card-bg)',
        overflow: 'hidden',
        transition: 'all 0.2s',
        marginBottom: '12px',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
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
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${statusColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: '700', color: statusColor }}>
            {category.score}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
              {category.name}
            </h3>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'capitalize',
                background: statusBg,
                color: statusColor,
                border: `1px solid ${statusBorder}`,
              }}
            >
              {getStatusLabel(category.status)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span><strong style={{ color: 'var(--text)' }}>{category.checksPassed}</strong> / {category.checksTotal} checks passed</span>
            <span style={{ color: category.issueCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {category.issueCount} issue{category.issueCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <svg
            width="24"
            height="24"
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {SEVERITY_ORDER.map(({ key, label, icon }) => {
              const issues = category.issues[key] ?? [];
              if (issues.length === 0) return null;

              return (
                <SeveritySection
                  key={key}
                  severityKey={key}
                  label={label}
                  icon={icon}
                  issues={issues}
                  expandedIssues={expandedIssues}
                  onToggleIssue={onToggleIssue}
                  expandedEvidencePages={expandedEvidencePages}
                  onToggleEvidencePage={onToggleEvidencePage}
                  onOpenIssueDetail={onOpenIssueDetail}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}