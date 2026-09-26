import React, { useState } from 'react';
import { ToolInputWrapper } from './ToolCard';
import { useRobotsCheck, extractBareDomain } from '../../hooks/useRobotsCheck';
import { RobotsSummaryCards } from './robots/RobotsSummaryCards';
import { RobotsSitemapsCard } from './robots/RobotsSitemapsCard';
import { RobotsFindingsList } from './robots/RobotsFindingsList';
import { RobotsRecommendationsList } from './robots/RobotsRecommendationsList';
import { RobotsRawContent } from './robots/RobotsRawContent';

export function RobotsTxtTool({ onBack }: { onBack: () => void }) {
  const [domainInput, setDomainInput] = useState('');
  const {
    isLoading,
    result,
    error,
    startCheck,
    reset,
  } = useRobotsCheck();

  const previewBareDomain = extractBareDomain(domainInput);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domainInput.trim() || isLoading) return;
    startCheck(domainInput);
  };

  const handleNewCheck = () => {
    reset();
  };

  return (
    <ToolInputWrapper
      title="robots.txt Inspector & Evaluator"
      desc="Fetch, parse, validate, and test crawling directives, sitemap declarations, and syntax warnings for any domain."
      onBack={onBack}
    >
      {/* Domain Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="tool-form-row">
          <input
            type="text"
            placeholder="example.com or https://example.com/robots.txt"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: '15px',
              fontFamily: 'inherit',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              background: '#0b1220',
              color: 'var(--text)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          />

          <button
            type="submit"
            disabled={!domainInput.trim() || isLoading}
            style={{
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: 'inherit',
              color: '#fff',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '10px',
              cursor: !domainInput.trim() || isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
              opacity: !domainInput.trim() || isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Checking...' : 'Check robots.txt'}
          </button>
        </div>

        {domainInput && previewBareDomain && previewBareDomain !== domainInput && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Target Domain: </span>
            <code style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '2px 8px', borderRadius: '4px', color: 'var(--primary)' }}>
              {previewBareDomain}
            </code>
          </div>
        )}
      </form>

      {/* Error Message Banner */}
      {error && (
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleNewCheck}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div
          style={{
            padding: '36px 24px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              border: '3px solid rgba(37, 99, 235, 0.2)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '600' }}>
              Fetching & Analyzing robots.txt...
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Performing live fetch, syntax parsing, sitemap reachability, and rule evaluation.
            </p>
          </div>
        </div>
      )}

      {/* Results View */}
      {!isLoading && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Actions bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Check result for <strong style={{ color: 'var(--text)' }}>{result.domain}</strong>
            </div>
            <button
              type="button"
              onClick={handleNewCheck}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                background: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid var(--primary)',
                borderRadius: '8px',
                color: 'var(--primary)',
                cursor: 'pointer',
              }}
            >
              Start New Check
            </button>
          </div>

          {/* 1. Summary Cards & Attributes */}
          <RobotsSummaryCards result={result} />

          {/* 2. Declared Sitemaps & Reachability Table */}
          <RobotsSitemapsCard
            sitemapsDeclared={result.sitemaps_declared || []}
            sitemapReachability={result.sitemap_reachability || []}
          />

          {/* 3. Foldable Findings & Syntax Warnings */}
          <RobotsFindingsList
            findings={result.findings || []}
            syntaxWarnings={result.syntax_warnings || []}
          />

          {/* 4. Foldable Recommendations */}
          <RobotsRecommendationsList recommendations={result.recommendations || []} />

          {/* 5. Raw robots.txt Content & Optional Markdown */}
          <RobotsRawContent
            rawContent={result.raw_content}
            reportMarkdown={result.report_markdown}
          />
        </div>
      )}
    </ToolInputWrapper>
  );
}