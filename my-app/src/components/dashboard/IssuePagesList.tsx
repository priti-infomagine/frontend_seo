import type { IssuePage } from '../../types/audit';
import { PaginatedList } from '../common/PaginatedList';

interface IssuePagesListProps {
  pages: IssuePage[];
}

export function IssuePagesList({ pages }: IssuePagesListProps) {
  const renderPage = (page: IssuePage, index: number) => (
    <div
      style={{
        padding: '12px 16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <a
          href={page.page_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '13px',
            color: 'var(--primary)',
            textDecoration: 'none',
            wordBreak: 'break-all',
            flex: 1,
            minWidth: 0,
          }}
          title={page.page_url}
        >
          {page.page_url}
        </a>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          #{index + 1}
        </span>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text)', paddingLeft: '4px' }}>
        <strong style={{ color: 'var(--text-muted)' }}>Found:</strong> {page.current_value}
      </div>

      {page.evidence && Object.keys(page.evidence).length > 0 && (
        <details style={{ marginTop: '4px' }}>
          <summary style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 0' }}>
            Evidence ({Object.keys(page.evidence).length})
          </summary>
          <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(page.evidence, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {page.classified_images && page.classified_images.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Classified Images ({page.classified_images.length})
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {page.classified_images.slice(0, 6).map((img, i) => (
              <div key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '2px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                {JSON.stringify(img).slice(0, 50)}...
              </div>
            ))}
            {page.classified_images.length > 6 && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '2px' }}>
                +{page.classified_images.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="issue-pages-list" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
          Affected Pages ({pages.length})
        </h5>
      </div>
      <PaginatedList
        items={pages}
        renderItem={renderPage}
        itemsPerPage={15}
        pageSizeOptions={[10, 15, 25, 50]}
        showPageSizeSelector={true}
      />
    </div>
  );
}