import { useState } from 'react';
import type { AuditInfo } from '../../types/audit';
import { UnavailableMetricDisplay } from '../common/UnavailableMetricDisplay';
import { formatNumber } from '../../utils/format';

interface CrawlDetailsAccordionProps {
  audit: AuditInfo;
}

const tabs = [
  { id: 'crawl', label: 'Crawl Stats', icon: '🕷️' },
  { id: 'indexation', label: 'Indexation', icon: '📇' },
  { id: 'links', label: 'Links', icon: '🔗' },
  { id: 'images', label: 'Images', icon: '🖼️' },
  { id: 'structured', label: 'Structured Data', icon: '📋' },
  { id: 'content', label: 'Content', icon: '📝' },
] as const;

type TabId = typeof tabs[number]['id'];

export function CrawlDetailsAccordion({ audit }: CrawlDetailsAccordionProps) {
  const [activeTab, setActiveTab] = useState<TabId>('crawl');

  const renderCrawlStats = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      <StatCard label="Discovered" value={formatNumber(audit.crawl_stats.discovered)} />
      <StatCard label="Crawled" value={formatNumber(audit.crawl_stats.crawled)} />
      <StatCard label="Redirects" value={formatNumber(audit.crawl_stats.redirects)} />
      <StatCard label="Crawl Errors" value={formatNumber(audit.crawl_stats.crawl_errors)} />
      <StatCard
        label="Blocked by Robots"
        value={
          <UnavailableMetricDisplay metric={audit.crawl_stats.blocked_by_robots} showValue={true} />
        }
      />
      <StatCard
        label="Orphan Pages"
        value={
          <UnavailableMetricDisplay metric={audit.crawl_stats.orphan_pages} showValue={true} />
        }
      />
    </div>
  );

  const renderStatusCodes = () => {
    const codes = audit.crawl_stats.status_codes;
    if (!codes || Object.keys(codes).length === 0) {
      return <div style={{ color: 'var(--text-muted)', padding: '16px' }}>No status code data available</div>;
    }
    const sorted = Object.entries(codes).sort(([, a], [, b]) => b - a);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
        {sorted.map(([code, count]) => (
          <div key={code} style={{ padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>{count}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{code}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderIndexation = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
      <StatCard label="Indexable" value={formatNumber(audit.indexation.indexable)} />
      <StatCard label="Noindex" value={formatNumber(audit.indexation.noindex)} />
      <StatCard label="Canonicalized" value={formatNumber(audit.indexation.canonicalized)} />
      <StatCard label="Not Indexable" value={formatNumber(audit.indexation.not_indexable)} />
      <StatCard label="Blocked by Robots" value={formatNumber(audit.indexation.blocked_by_robots)} />
    </div>
  );

  const renderLinks = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      <StatCard label="Internal Total" value={formatNumber(audit.links.internal.total)} />
      <StatCard label="Internal Broken" value={formatNumber(audit.links.internal.broken)} valueStyle={{ color: audit.links.internal.broken > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="External Total" value={formatNumber(audit.links.external.total)} />
      <StatCard label="External Broken" value={formatNumber(audit.links.external.broken)} valueStyle={{ color: audit.links.external.broken > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Orphan Pages" value={formatNumber(audit.links.orphan_pages)} />
      <StatCard label="Total Links" value={formatNumber(audit.links.total_links)} />
    </div>
  );

  const renderImages = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
      <StatCard label="Total Images" value={formatNumber(audit.images.total)} />
      <StatCard label="Missing Alt" value={formatNumber(audit.images.missing_alt)} valueStyle={{ color: audit.images.missing_alt > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Empty Alt" value={formatNumber(audit.images.empty_alt)} valueStyle={{ color: audit.images.empty_alt > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Missing Dimensions" value={formatNumber(audit.images.missing_dimensions)} valueStyle={{ color: audit.images.missing_dimensions > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Oversized" value={formatNumber(audit.images.oversized)} valueStyle={{ color: audit.images.oversized > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Modern Format" value={formatNumber(audit.images.modern_format)} valueStyle={{ color: 'var(--success)' }} />
      <StatCard label="Lazy Loading" value={formatNumber(audit.images.lazy_loading)} valueStyle={{ color: 'var(--success)' }} />
    </div>
  );

  const renderStructuredData = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="With Schema" value={formatNumber(audit.structured_data.pages_with_schema)} />
        <StatCard label="Without Schema" value={formatNumber(audit.structured_data.pages_without_schema)} />
        <StatCard label="Valid" value={formatNumber(audit.structured_data.valid)} valueStyle={{ color: 'var(--success)' }} />
        <StatCard label="Invalid" value={formatNumber(audit.structured_data.invalid)} valueStyle={{ color: audit.structured_data.invalid > 0 ? 'var(--danger)' : 'var(--success)' }} />
      </div>
      {audit.structured_data.types && Object.keys(audit.structured_data.types).length > 0 && (
        <div>
          <h5 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Schema Types</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(audit.structured_data.types)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <span key={type} style={{ padding: '6px 12px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '12px', color: 'var(--text)' }}>
                  {type} <span style={{ color: 'var(--text-muted)' }}>({count})</span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      <StatCard label="Thin Pages" value={formatNumber(audit.content.thin_pages)} valueStyle={{ color: audit.content.thin_pages > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Duplicate Pages" value={formatNumber(audit.content.duplicate_pages)} valueStyle={{ color: audit.content.duplicate_pages > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Duplicate Groups" value={formatNumber(audit.content.duplicate_groups)} />
      <StatCard label="Near Duplicates" value={formatNumber(audit.content.near_duplicate_pages)} valueStyle={{ color: audit.content.near_duplicate_pages > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Missing Author" value={formatNumber(audit.content.missing_author)} valueStyle={{ color: audit.content.missing_author > 0 ? 'var(--danger)' : 'var(--success)' }} />
      <StatCard label="Outdated Pages" value={formatNumber(audit.content.outdated_pages)} valueStyle={{ color: audit.content.outdated_pages > 0 ? 'var(--danger)' : 'var(--success)' }} />
    </div>
  );

  const tabContent: Record<TabId, React.ReactNode> = {
    crawl: (
      <>
        {renderCrawlStats()}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <h5 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HTTP Status Codes</h5>
          {renderStatusCodes()}
        </div>
      </>
    ),
    indexation: renderIndexation(),
    links: renderLinks(),
    images: renderImages(),
    structured: renderStructuredData(),
    content: renderContent(),
  };

  return (
    <div className="crawl-details-accordion" style={{ marginBottom: '24px' }}>
      <div
        className="accordion-header"
        style={{
          padding: '16px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px 12px 0 0',
          fontWeight: '600',
          fontSize: '15px',
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span>📊</span>
        Crawl & Technical Details
      </div>
      <div
        className="accordion-tabs"
        style={{
          display: 'flex',
          gap: '4px',
          padding: '0 16px 16px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          overflowX: 'auto',
        }}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '500',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === tab.id ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        style={{
          padding: '24px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
        }}
      >
        {tabContent[activeTab]}
      </div>
    </div>
  );
}

function StatCard({ label, value, valueStyle }: { label: string; value: React.ReactNode; valueStyle?: React.CSSProperties }) {
  return (
    <div style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ ...valueStyle, fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>{value}</div>
    </div>
  );
}