import { useState, useMemo } from 'react';
import type { Category, Issue } from '../../types/audit';
import { CategoryCard } from './CategoryCard';
import { filterIssuesByCategory } from '../../types/mapping';

interface CategoryGridProps {
  categories: Category[];
  issues: Issue[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  sortByWorstFirst?: boolean;
}

export function CategoryGrid({ categories, issues, selectedCategory, onSelectCategory, sortByWorstFirst = true }: CategoryGridProps) {
  const [sortWorstFirst, setSortWorstFirst] = useState(sortByWorstFirst);

  const sortedCategories = useMemo(() => {
    const cats = [...categories];
    if (sortWorstFirst) {
      cats.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    }
    return cats;
  }, [categories, sortWorstFirst]);

  const categoryIssueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.id] = filterIssuesByCategory(issues, cat.id).length;
    });
    return counts;
  }, [categories, issues]);

  return (
    <div className="category-grid" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Category Scores</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={sortWorstFirst}
            onChange={(e) => setSortWorstFirst(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
          />
          Sort worst first
        </label>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {sortedCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            issueCount={categoryIssueCounts[category.id] || 0}
            isSelected={selectedCategory === category.id}
            onClick={() => onSelectCategory(selectedCategory === category.id ? null : category.id)}
          />
        ))}
      </div>
    </div>
  );
}