import { useState, useMemo } from 'react';
import type { NormalizedIssue, IssuePage } from '../../types/audit';
import { getSeverityColor, getSeverityLabel } from '../../utils/colors';
import { PaginatedList } from '../common/PaginatedList';

interface EvidenceTabProps {
  issues: NormalizedIssue[];
}

interface EvidenceEntry {
  issue: NormalizedIssue;
  page: IssuePage;
  ruleId: string;
  severity: string;
  pageUrl: string;
  currentValue: string | null;
  evidence: Record<string, unknown> | null;
  evidenceKeys: string[];
  classifiedImagesCount: number;
}

export function EvidenceTab({ issues }: EvidenceTabProps) {
  const [searchText, setSearchText] = useState('');

  const allEvidence = useMemo(() => {
    const entries: EvidenceEntry[] = [];
    issues.forEach((issue) => {
      const pages = issue.pages ?? [];
      pages.forEach((page) => {
        const evidenceObj = page.evidence ?? {};
        const evidenceKeys = page.evidence ? Object.keys(page.evidence) : [];
        if (evidenceKeys.length > 0) {
          entries.push({
            issue,
            page,
            ruleId: issue.rule_id,
            severity: issue.severity,
            pageUrl: page.page_url,
            currentValue: page.current_value,
            evidence: evidenceObj,
            evidenceKeys,
            classifiedImagesCount: page.classified_images ? page.classified_images.length : 0,
          });
        }
      });
    });

    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    entries.sort((a, b) => {
      const aOrder = severityOrder[a.severity] ?? 4;
      const bOrder = severityOrder[b.severity] ?? 4;
      return aOrder - bOrder;
    });

    return entries;
  }, [issues]);

  const filteredEvidence = useMemo(() => {
    if (!searchText.trim()) return allEvidence;
    const query = searchText.toLowerCase().trim();
    return allEvidence.filter(entry =>
      entry.ruleId.toLowerCase().includes(query) ||
      entry.issue.title.toLowerCase().includes(query) ||
      entry.pageUrl.toLowerCase().includes(query) ||
      entry.evidenceKeys.some(k => k.toLowerCase().includes(query))
    );
  }, [allEvidence, searchText]);

  const totalEvidenceFields = useMemo(() => {
    return allEvidence.reduce((sum, entry) => sum + entry.evidenceKeys.length, 0);
  }, [allEvidence]);

  const renderEvidenceCard = (entry: EvidenceEntry, index: number) => {
    const severityColor = getSeverityColor(entry.severity);
    const severityBg = `${severityColor}15`;
    const severityBorder = `${severityColor}40`;

    return (
      <div
        className="evidence-card"
        style={{
          border: `1px solid ${severityBorder}`,
          borderRadius: '12px',
          background: severityBg,
          overflow: 'hidden',
          transition: 'all 0.2s',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
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
            {entry.severity.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
              {entry.issue.title}
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {entry.ruleId}
            </span>
          </div>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: '600',
              textTransform: 'uppercase',
              background: severityBg,
              color: severityColor,
              border: `1px solid ${severityBorder}`,
              flexShrink: 0,
            }}
          >
            {getSeverityLabel(entry.severity)}
          </span>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Page</span>
              <a
                href={entry.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}
                title={entry.pageUrl}
              >
                {entry.pageUrl}
              </a>
            </div>

            {entry.currentValue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Value</span>
                <span style={{ fontSize: '12px', color: 'var(--text)', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {entry.currentValue}
                </span>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                Evidence Fields ({entry.evidenceKeys.length})
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                #{index + 1}
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'rgba(15, 23, 42, 0.3)', borderBottom: '1px solid var(--border)' }}>
                JSON Evidence
              </div>
              <div style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', maxHeight: '250px', overflow: 'auto' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(entry.evidence, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {entry.classifiedImagesCount > 0 && (
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                Classified Images ({entry.classifiedImagesCount})
              </span>
              <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {entry.page.classified_images!.slice(0, 8).map((img: unknown, i: number) => (
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
                    title={typeof img === 'object' ? JSON.stringify(img) : String(img)}
                  >
                    {typeof img === 'object' ? JSON.stringify(img).slice(0, 40) : String(img)}
                  </div>
                ))}
                {entry.classifiedImagesCount > 8 && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    +{entry.classifiedImagesCount - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="evidence-tab" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px', margin: '0 auto', flex: 1 }}>
      <div
        className="evidence-summary"
        style={{
          padding: '16px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{allEvidence.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pages With Evidence
          </div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>{totalEvidenceFields}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Evidence Fields
          </div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
            {new Set(allEvidence.map(e => e.ruleId)).size}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Unique Rules
          </div>
        </div>
      </div>

      <div
        className="evidence-toolbar"
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '16px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            Search evidence
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by rule ID, title, page URL, evidence field..."
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
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          />
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredEvidence.length}</strong> of{' '}
          <strong>{allEvidence.length}</strong> evidence entries
        </div>
      </div>

      {filteredEvidence.length === 0 ? (
        <div
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            {searchText
              ? 'No evidence matches your search'
              : 'No evidence data available'}
          </div>
          {searchText && (
            <div style={{ fontSize: '13px' }}>
              Try adjusting your search terms
            </div>
          )}
        </div>
      ) : (
        <PaginatedList
          items={filteredEvidence}
          renderItem={renderEvidenceCard}
          itemsPerPage={15}
          pageSizeOptions={[10, 15, 25, 50]}
        />
      )}
    </div>
  );
}
