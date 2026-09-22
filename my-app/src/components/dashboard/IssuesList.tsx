import { useState, useMemo, useCallback } from 'react';
import type { Issue } from '../../types/audit';
import { IssueRow } from './IssueRow';
import { filterIssuesByCategory } from '../../types/mapping';
import { getSeverityColor } from '../../utils/colors';

interface IssuesListProps {
  issues: Issue[];
  categories: { id: string; name: string }[];
  selectedCategory: string | null;
  selectedSeverity: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSeverity: (severity: string | null) => void;
}

export function IssuesList({
  issues,
  categories,
  selectedCategory,
  selectedSeverity,
  onSelectCategory,
  onSelectSeverity,
}: IssuesListProps) {
  const [searchText, setSearchText] = useState('');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const filteredIssues = useMemo(() => {
    let result = [...issues];

    if (selectedCategory) {
      result = filterIssuesByCategory(result, selectedCategory);
    }

    if (selectedSeverity && selectedSeverity !== 'total') {
      result = result.filter((issue) => issue.severity === selectedSeverity);
    }

    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      result = result.filter((issue) =>
        issue.title.toLowerCase().includes(query) ||
        issue.rule_id.toLowerCase().includes(query) ||
        (issue.recommendation ? issue.recommendation.toLowerCase().includes(query) : false)
      );
    }

    return result;
  }, [issues, selectedCategory, selectedSeverity, searchText]);

  const toggleIssue = useCallback((ruleId: string) => {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    onSelectCategory(null);
    onSelectSeverity(null);
    setSearchText('');
  }, [onSelectCategory, onSelectSeverity]);

  const hasActiveFilters = selectedCategory || selectedSeverity || searchText.trim();

  return (
    <div className="issues-list" style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Search issues
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by title, rule ID, recommendation..."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                background: '#0b1220',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => onSelectCategory(e.target.value || null)}
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  background: '#0b1220',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  minWidth: '180px',
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Severity
              </label>
              <select
                value={selectedSeverity || ''}
                onChange={(e) => onSelectSeverity(e.target.value || null)}
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  background: '#0b1220',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  minWidth: '140px',
                }}
              >
                <option value="">All Severities</option>
                <option value="critical" style={{ color: getSeverityColor('critical') }}>Critical</option>
                <option value="high" style={{ color: getSeverityColor('high') }}>High</option>
                <option value="medium" style={{ color: getSeverityColor('medium') }}>Medium</option>
                <option value="low" style={{ color: getSeverityColor('low') }}>Low</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing {filteredIssues.length} of {issues.length} issue{issues.length !== 1 ? 's' : ''}
          {hasActiveFilters && (
            <span style={{ marginLeft: '8px', color: 'var(--primary)' }}> (filtered)</span>
          )}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            {searchText ? 'No issues match your search' : selectedCategory || selectedSeverity ? 'No issues match the selected filters' : 'No issues found'}
          </div>
          <div style={{ fontSize: '13px' }}>Try adjusting your filters or search terms</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredIssues.map((issue) => (
            <IssueRow
              key={issue.rule_id}
              issue={issue}
              isExpanded={expandedIssues.has(issue.rule_id)}
              onToggle={() => toggleIssue(issue.rule_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}