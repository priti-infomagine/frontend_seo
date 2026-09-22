import { useState, useMemo } from 'react';
import type { NormalizedAuditResult, StructuredIssue } from '../types/audit';
import {
  ReportHeader,
  CategorySidebar,
  OverviewTab,
  IssuesTab,
  RecommendationsTab,
  EvidenceTab,
  IssueDetailPanel,
  CrawlDetailsAccordion,
  CoverageLimitationsPanel,
  ErrorsPanel,
  RawJsonViewer,
} from '../components/dashboard';
import { groupAuditIssues, filterGroupedIssues } from '../utils/groupAuditIssues';

interface ResultsDashboardProps {
  result: NormalizedAuditResult;
  onNewAudit: () => void;
}

type ActiveTab = 'overview' | 'issues' | 'recommendations' | 'evidence';

export function ResultsDashboard({ result, onNewAudit }: ResultsDashboardProps) {
  const { audit, summary, categories, issues, raw } = result;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<StructuredIssue | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [expandedEvidencePages, setExpandedEvidencePages] = useState<Set<string>>(new Set());

  const groupedIssues = useMemo(
    () => groupAuditIssues(categories, issues),
    [categories, issues]
  );

  const filteredGroups = useMemo(
    () => filterGroupedIssues(groupedIssues, selectedCategory, selectedSeverity),
    [groupedIssues, selectedCategory, selectedSeverity]
  );

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSeveritySelect = (severity: string | null) => {
    setSelectedSeverity(severity);
  };

  const handleOpenIssueDetail = (issue: StructuredIssue) => {
    setSelectedIssue(issue);
  };

  const handleCloseIssueDetail = () => {
    setSelectedIssue(null);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const expandAll = () => {
    setExpandedCategories(
      new Set(groupedIssues.map((g) => g.id)),
    );
    setExpandedIssues(
      new Set(groupedIssues.flatMap((g) => Object.values(g.issues).flat()).map((i) => i.ruleId)),
    );
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
    setExpandedIssues(new Set());
  };

  const tabs = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: '📊' },
    { id: 'issues' as ActiveTab, label: 'Issues', icon: '⚠️', count: issues.length },
    { id: 'recommendations' as ActiveTab, label: 'Recommendations', icon: '💡' },
    { id: 'evidence' as ActiveTab, label: 'Evidence', icon: '🔍' },
  ];

  return (
    <div
      className="results-dashboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Audit Results</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {audit.url} · {audit.pages?.crawled ?? '—'} pages · Duration shown below
          </p>
        </div>
        <button
          type="button"
          onClick={onNewAudit}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'inherit',
            color: 'var(--text)',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          New Audit
        </button>
      </div>

      {/* Report Header (score + meta cards) */}
      <ReportHeader audit={audit} summary={summary} />

      {/* Tab Bar */}
      <div
        className="dashboard-tabs"
        style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: '600',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              background:
                activeTab === tab.id
                  ? 'rgba(37, 99, 235, 0.1)'
                  : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${
                activeTab === tab.id ? 'var(--primary)' : 'transparent'
              }`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background:
                    activeTab === tab.id
                      ? 'var(--primary)'
                      : 'rgba(148, 163, 184, 0.3)',
                  color:
                    activeTab === tab.id
                      ? '#fff'
                      : 'var(--text-muted)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div
        className="dashboard-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '24px',
        }}
      >
        {activeTab === 'overview' && (
          <OverviewTab audit={audit} summary={summary} />
        )}

        {activeTab === 'issues' && (
          <IssuesTab
            grouped={filteredGroups}
            selectedCategory={selectedCategory}
            selectedSeverity={selectedSeverity}
            onSelectCategory={handleCategorySelect}
            onSelectSeverity={handleSeveritySelect}
            onOpenIssueDetail={handleOpenIssueDetail}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            expandedIssues={expandedIssues}
            setExpandedIssues={setExpandedIssues}
            expandedEvidencePages={expandedEvidencePages}
            setExpandedEvidencePages={setExpandedEvidencePages}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsTab
            issues={issues}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {activeTab === 'evidence' && <EvidenceTab issues={issues} />}
      </div>

      {/* Secondary Content (Crawl Details, Errors, Limitations, Raw JSON) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
        {audit.errors && audit.errors.length > 0 && (
          <ErrorsPanel audit={audit} />
        )}
        <CrawlDetailsAccordion audit={audit} />
        {audit.external_dependencies && audit.external_dependencies.length > 0 && (
          <CoverageLimitationsPanel audit={audit} />
        )}
      </div>

      {/* Raw JSON Viewer - uses original raw payload */}
      <RawJsonViewer data={raw} />

      {/* Issue Detail Panel (slide-over) */}
      {selectedIssue && (
        <IssueDetailPanel
          issue={selectedIssue.raw}
          onClose={handleCloseIssueDetail}
        />
      )}

      {/* Category Sidebar (always available for category filtering) */}
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        isCollapsed={true}
        onToggleCollapse={() => {}}
        grouped={groupedIssues}
      />
    </div>
  );
}