import { useMemo } from 'react';
import type { Category, GroupedCategory } from '../../types/audit';
import { getSeverityColor } from '../../utils/colors';
import { formatScore } from '../../utils/format';

interface CategorySidebarProps {
  categories: Category[];
  grouped: GroupedCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function CategorySidebar({
  categories,
  grouped,
  selectedCategory,
  onSelectCategory,
  isCollapsed,
  onToggleCollapse,
}: CategorySidebarProps) {
  const categoryIssueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    grouped.forEach((g) => {
      counts[g.id] = g.issueCount;
    });
    return counts;
  }, [grouped]);

  const sortedCategories = useMemo(() => {
    const cats = [...categories];
    cats.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return cats;
  }, [categories]);

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="sidebar-toggle"
        style={{
          position: 'fixed',
          left: '12px',
          top: '12px',
          zIndex: 100,
          padding: '8px 12px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text)',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
        aria-label="Expand sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span>Audit Report</span>
      </button>
    );
  }

  return (
    <aside
      className="category-sidebar"
      style={{
        width: '280px',
        minWidth: '280px',
        background: 'var(--card-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Categories</h2>
          <button
            onClick={onToggleCollapse}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Collapse
          </button>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Click a category to filter issues
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => onSelectCategory(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: selectedCategory === null ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              border: selectedCategory === null ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '8px',
              color: selectedCategory === null ? 'var(--primary)' : 'var(--text)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '600', fontSize: '13px' }}>All Categories</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {grouped.reduce((sum, g) => sum + g.issueCount, 0)} issues
              </div>
            </div>
          </button>

          {sortedCategories.map((category: Category) => {
            const issueCount = categoryIssueCounts[category.id] || 0;
            const isSelected = selectedCategory === category.id;
            const statusColor = getSeverityColor(category.status);

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(isSelected ? null : category.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: isSelected ? `${statusColor}15` : 'transparent',
                  border: isSelected ? `1px solid ${statusColor}` : '1px solid var(--border)',
                  borderRadius: '8px',
                  color: isSelected ? statusColor : 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = statusColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: statusColor }}>
                    {formatScore(category.score)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{category.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {category.checks_passed ?? 0}/{category.checks_total ?? 0} checks · {issueCount} issue{issueCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    background: `${statusColor}20`,
                    color: statusColor,
                  }}
                >
                  {(category.status ?? '').replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
        Sorted by score (worst first)
      </div>
    </aside>
  );
}
