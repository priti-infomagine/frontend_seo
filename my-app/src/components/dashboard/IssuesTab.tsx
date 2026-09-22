import type { GroupedCategory, StructuredIssue, SeverityLevel } from '../../types/audit';
import { IssueCategoryAccordion } from './IssueCategoryAccordion';

interface IssuesTabProps {
  grouped: GroupedCategory[];
  selectedCategory: string | null;
  selectedSeverity: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSeverity: (severity: string | null) => void;
  onOpenIssueDetail: (issue: StructuredIssue) => void;
  expandedCategories: Set<string>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedIssues: Set<string>;
  setExpandedIssues: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedEvidencePages: Set<string>;
  setExpandedEvidencePages: React.Dispatch<React.SetStateAction<Set<string>>>;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const SEVERITY_OPTIONS: { key: SeverityLevel; label: string; icon: string }[] = [
  { key: 'critical', label: 'Critical', icon: '🔴' },
  { key: 'high', label: 'High', icon: '🟠' },
  { key: 'medium', label: 'Medium', icon: '🟡' },
  { key: 'low', label: 'Low', icon: '🔵' },
  { key: 'other', label: 'Other', icon: '⚪' },
];

export function IssuesTab({
  grouped,
  selectedCategory,
  selectedSeverity,
  onSelectSeverity,
  onOpenIssueDetail,
  expandedCategories,
  setExpandedCategories,
  expandedIssues,
  setExpandedIssues,
  expandedEvidencePages,
  setExpandedEvidencePages,
  onExpandAll,
  onCollapseAll,
}: IssuesTabProps) {
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleSeverity = (severity: string | null) => {
    onSelectSeverity(selectedSeverity === severity ? null : severity);
  };

  const totalIssues = grouped.reduce((sum, g) => sum + g.issueCount, 0);
  const visibleCategories = grouped.filter((g) => g.issueCount > 0);

  return (
    <div className="issues-tab" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px', margin: '0 auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{totalIssues}</strong> issues across <strong>{visibleCategories.length}</strong> categories
          {(selectedCategory || selectedSeverity) && (
            <span style={{ marginLeft: '8px', color: 'var(--primary)' }}> (filtered)</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onCollapseAll}
            style={{
              padding: '8px 14px', fontSize: '12px', fontWeight: '500',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            Collapse All
          </button>
          <button
            type="button"
            onClick={onExpandAll}
            style={{
              padding: '8px 14px', fontSize: '12px', fontWeight: '500',
              background: 'var(--primary)', border: 'none',
              borderRadius: '8px', color: '#fff', cursor: 'pointer',
            }}
          >
            Expand All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        {SEVERITY_OPTIONS.map(({ key, label, icon }) => {
          const count = grouped.reduce(
            (sum, g) => sum + (g.issues[key]?.length ?? 0),
            0,
          );
          const isActive = selectedSeverity === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleSeverity(key)}
              style={{
                padding: '8px 14px', fontSize: '12px', fontWeight: '600',
                background: isActive ? 'var(--primary)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '8px', color: isActive ? '#fff' : 'var(--text)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {icon} {label} ({count})
            </button>
          );
        })}
        {selectedSeverity && (
          <button
            type="button"
            onClick={() => toggleSeverity(null)}
            style={{
              padding: '8px 14px', fontSize: '12px', fontWeight: '500',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            Clear Severity
          </button>
        )}
      </div>

      {visibleCategories.length === 0 ? (
        <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No issues found</div>
          <div style={{ fontSize: '13px' }}>This audit found no issues to report.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {grouped.map((category) =>
            category.issueCount > 0 ? (
              <IssueCategoryAccordion
                key={category.id}
                category={category}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
                expandedIssues={expandedIssues}
                onToggleIssue={(ruleId: string) =>
                  setExpandedIssues((prev) => {
                    const next = new Set(prev);
                    if (next.has(ruleId)) {
                      next.delete(ruleId);
                    } else {
                      next.add(ruleId);
                    }
                    return next;
                  })
                }
                expandedEvidencePages={expandedEvidencePages}
                onToggleEvidencePage={(key: string) =>
                  setExpandedEvidencePages((prev) => {
                    const next = new Set(prev);
                    if (next.has(key)) {
                      next.delete(key);
                    } else {
                      next.add(key);
                    }
                    return next;
                  })
                }
                onOpenIssueDetail={onOpenIssueDetail}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
