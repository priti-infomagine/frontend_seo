import { useState, useMemo } from 'react';
import type { NormalizedIssue } from '../../types/audit';
import { getSeverityColor } from '../../utils/colors';
import { getIssueCategory } from '../../types/mapping';

interface RecommendationsTabProps {
  issues: NormalizedIssue[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function RecommendationsTab({ issues, selectedCategory, onSelectCategory }: RecommendationsTabProps) {
  const [searchText, setSearchText] = useState('');

  const filteredIssues = useMemo(() => {
    let result = [...issues];

    if (selectedCategory) {
      const issueCategory = getIssueCategory(selectedCategory) ?? selectedCategory;
      result = result.filter((issue) => issue.category === issueCategory);
    }

    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      result = result.filter((issue) =>
        issue.title.toLowerCase().includes(query) ||
        (issue.recommendation ? issue.recommendation.toLowerCase().includes(query) : false) ||
        (issue.llm_tips && issue.llm_tips.some(tip => tip.toLowerCase().includes(query)))
      );
    }

    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => (severityOrder[a.severity as keyof typeof severityOrder] || 4) - (severityOrder[b.severity as keyof typeof severityOrder] || 4));

    return result;
  }, [issues, selectedCategory, searchText]);

  const clearFilters = () => {
    onSelectCategory(null);
    setSearchText('');
  };

  const hasActiveFilters = selectedCategory || searchText.trim();

  const issuesBySeverity = useMemo(() => {
    const groups: Record<string, NormalizedIssue[]> = { critical: [], high: [], medium: [], low: [] };
    filteredIssues.forEach(issue => {
      if (groups[issue.severity]) {
        groups[issue.severity].push(issue);
      } else {
        groups.low.push(issue);
      }
    });
    return groups;
  }, [filteredIssues]);

  return (
    <div className="recommendations-tab" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px', margin: '0 auto', flex: 1 }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Search recommendations
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by title, recommendation, AI tips..."
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

        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredIssues.length}</strong> of <strong>{issues.length}</strong> recommendations
          {hasActiveFilters && <span style={{ marginLeft: '8px', color: 'var(--primary)' }}> (filtered)</span>}
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
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredIssues.length === 0 ? (
        <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            {searchText ? 'No recommendations match your search' : selectedCategory ? 'No recommendations in this category' : 'No recommendations found'}
          </div>
          <div style={{ fontSize: '13px' }}>Try adjusting your filters or search terms</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'critical', label: 'Critical Priority', color: getSeverityColor('critical'), icon: '🔴' },
            { key: 'high', label: 'High Priority', color: getSeverityColor('high'), icon: '🟠' },
            { key: 'medium', label: 'Medium Priority', color: getSeverityColor('medium'), icon: '🟡' },
            { key: 'low', label: 'Low Priority', color: getSeverityColor('low'), icon: '🔵' },
          ].map(({ key, label, color, icon }) => {
            const severityIssues = issuesBySeverity[key] || [];
            if (severityIssues.length === 0) return null;

            return (
              <div key={key} style={{ border: `1px solid ${color}40`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: `${color}10`, borderBottom: `1px solid ${color}30`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color }}>{label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{severityIssues.length} recommendation{severityIssues.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  {severityIssues.map((issue) => (
                    <RecommendationCard key={issue.rule_id} issue={issue} severityColor={color} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface RecommendationCardProps {
  issue: NormalizedIssue;
  severityColor: string;
}

function RecommendationCard({ issue, severityColor }: RecommendationCardProps) {
  const severityBg = `${severityColor}15`;
  const severityBorder = `${severityColor}40`;

  return (
    <div style={{ marginBottom: '12px', padding: '16px', background: severityBg, border: `1px solid ${severityBorder}`, borderRadius: '10px', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
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
            fontSize: '11px',
            flexShrink: 0,
            textTransform: 'uppercase',
          }}
        >
          {issue.severity.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{issue.title}</h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{issue.rule_id}</span>
        </div>
      </div>

      <div style={{ paddingLeft: '44px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
          {issue.recommendation || 'No recommendation available.'}
        </div>

        {issue.llm_tips && issue.llm_tips.length > 1 && (
          <details style={{ marginTop: '8px' }}>
            <summary style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '500', padding: '4px 0' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                AI Tips ({issue.llm_tips.length - 1} additional)
              </span>
            </summary>
            <ul style={{ margin: '12px 0 0', paddingLeft: '20px', color: 'var(--text)', lineHeight: 1.8 }}>
              {issue.llm_tips.slice(1).map((tip, i) => (
                <li key={i} style={{ marginBottom: '8px', fontSize: '13px' }}>{tip}</li>
              ))}
            </ul>
          </details>
        )}

        {(issue.why || issue.what) && (
          <details style={{ marginTop: '8px' }}>
            <summary style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '500', padding: '4px 0' }}>
              Technical Details
            </summary>
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {issue.why && <div><strong>Why:</strong> {issue.why}</div>}
              {issue.what && <div style={{ marginTop: '8px' }}><strong>What:</strong> {issue.what}</div>}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
