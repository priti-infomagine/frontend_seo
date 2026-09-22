import type { Category } from '../../types/audit';
import { getStatusColor, getStatusBgColor, getStatusBorderColor, getStatusLabel } from '../../utils/colors';
import { formatScore } from '../../utils/format';

interface CategoryCardProps {
  category: Category;
  issueCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryCard({ category, issueCount, isSelected, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="category-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--card-bg)',
        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        minHeight: '160px',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.background = 'rgba(37, 99, 235, 0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'var(--card-bg)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>{category.name}</h4>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'capitalize',
            background: getStatusBgColor(category.status),
            color: getStatusColor(category.status),
            border: `1px solid ${getStatusBorderColor(category.status)}`,
          }}
        >
          {getStatusLabel(category.status)}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Score</span>
           <span
             style={{
               fontWeight: '700',
               fontSize: '20px',
               color: getStatusColor(category.status),
             }}
           >
             {formatScore(category.score)}
           </span>
        </div>
        <div
          style={{
            height: '6px',
            background: 'var(--border)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
               width: `${category.score ?? 0}%`,
              height: '100%',
              background: getStatusColor(category.status),
              borderRadius: '3px',
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
        <span>
          <strong style={{ color: 'var(--text)' }}>{category.checks_passed ?? 0}</strong> / {category.checks_total ?? 0} checks passed
        </span>
        <span style={{ color: issueCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
          {issueCount} issue{issueCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
            <polyline points="18 15 12 21 6 15" />
            <polyline points="6 9 12 3 18 9" />
          </svg>
          Click to filter
        </span>
        {isSelected && (
          <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Active filter</span>
        )}
      </div>
    </button>
  );
}