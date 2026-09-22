import type { EvidencePage } from '../../types/audit';
import { safeJson } from '../../utils/format';

interface EvidencePageAccordionProps {
  page: EvidencePage;
  isExpanded: boolean;
  onToggle: () => void;
}

export function EvidencePageAccordion({ page, isExpanded, onToggle }: EvidencePageAccordionProps) {
  const hasEvidence = page.evidence && Object.keys(page.evidence).length > 0;

  return (
    <div
      style={{
        padding: '12px 14px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={isExpanded}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: 'var(--primary)',
              textDecoration: 'none',
              wordBreak: 'break-all',
              flex: 1,
              minWidth: 0,
            }}
            title={page.url}
          >
            {page.url}
          </a>
          {page.currentValue !== undefined && page.currentValue !== null && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {String(page.currentValue)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '11px' }}>#{page.url.slice(-8)}</span>
          <svg
            width="18"
            height="18"
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
        <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {page.currentValue !== undefined && page.currentValue !== null && (
            <div style={{ fontSize: '12px', color: 'var(--text)', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Current Value:</strong>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{String(page.currentValue)}</span>
            </div>
          )}

          {hasEvidence && (
            <details>
              <summary style={{ fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Evidence ({Object.keys(page.evidence).length} fields)
              </summary>
              <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', maxHeight: '300px', overflow: 'auto' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {safeJson(page.evidence)}
                </pre>
              </div>
            </details>
          )}

          {page.classifiedImages && page.classifiedImages.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
                Classified Images ({page.classifiedImages.length})
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {page.classifiedImages.slice(0, 8).map((img, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '6px 10px',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      fontFamily: 'monospace',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={typeof img === 'object' ? safeJson(img) : String(img)}
                  >
                    {typeof img === 'object' ? safeJson(img).slice(0, 60) : String(img)}
                  </div>
                ))}
                {page.classifiedImages.length > 8 && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', paddingTop: '2px' }}>
                    +{page.classifiedImages.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}