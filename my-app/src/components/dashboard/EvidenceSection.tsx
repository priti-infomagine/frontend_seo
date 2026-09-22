import { useState } from 'react';
import type { EvidencePage } from '../../types/audit';
import { EvidencePageAccordion } from './EvidencePageAccordion';

interface EvidenceSectionProps {
  evidence: {
    affectedPages: number;
    pages: EvidencePage[];
  };
  expandedEvidencePages: Set<string>;
  onToggleEvidencePage: (key: string) => void;
  ruleId: string;
}

export function EvidenceSection({
  evidence,
  expandedEvidencePages,
  onToggleEvidencePage,
  ruleId,
}: EvidenceSectionProps) {
  const INITIAL_PAGES = 10;
  const PAGE_INCREMENT = 20;

  const [pagesShown, setPagesShown] = useState(INITIAL_PAGES);
  const visiblePages = evidence.pages.slice(0, pagesShown);
  const hasMore = pagesShown < evidence.pages.length;

  const handleShowMore = () => {
    setPagesShown((prev) => Math.min(prev + PAGE_INCREMENT, evidence.pages.length));
  };

  const handleShowLess = () => {
    setPagesShown(INITIAL_PAGES);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <h5 style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Evidence ({evidence.affectedPages} affected page{evidence.affectedPages !== 1 ? 's' : ''})
        </h5>
        {evidence.pages.length > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Showing {visiblePages.length} of {evidence.pages.length}
          </span>
        )}
      </div>

      {evidence.pages.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          No evidence data available for this issue.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visiblePages.map((page) => (
              <EvidencePageAccordion
                key={`${ruleId}:${page.url}`}
                page={page}
                isExpanded={expandedEvidencePages.has(`${ruleId}:${page.url}`)}
                onToggle={() => onToggleEvidencePage(`${ruleId}:${page.url}`)}
              />
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={handleShowMore}
              style={{
                padding: '10px 16px',
                fontSize: '12px',
                fontWeight: '500',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                alignSelf: 'center',
                marginTop: '8px',
              }}
            >
              Show {Math.min(PAGE_INCREMENT, evidence.pages.length - pagesShown)} more
            </button>
          )}

          {pagesShown > INITIAL_PAGES && (
            <button
              type="button"
              onClick={handleShowLess}
              style={{
                padding: '8px 14px',
                fontSize: '11px',
                fontWeight: '500',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                alignSelf: 'center',
                marginTop: '8px',
              }}
            >
              Show less
            </button>
          )}
        </>
      )}
    </div>
  );
}