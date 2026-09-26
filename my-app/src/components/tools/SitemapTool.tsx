import React, { useState } from 'react';
import { ToolInputWrapper } from './ToolCard';
import { useSitemapCheck } from '../../hooks/useSitemapCheck';
import { SitemapSummaryCards } from './sitemap/SitemapSummaryCards';
import { SitemapTable } from './sitemap/SitemapTable';
import { SitemapFindingsList } from './sitemap/SitemapFindingsList';
import { SitemapRecommendationsList } from './sitemap/SitemapRecommendationsList';
import { PageAuditResultView } from './sitemap/PageAuditResultView';

export function SitemapTool({ onBack }: { onBack: () => void }) {
  const [inputUrl, setInputUrl] = useState('');
  const {
    stage,
    statusData,
    resultData,
    pageAudits,
    error,
    elapsedMs,
    isLoading,
    startCheck,
    cancelCheck,
    reset,
  } = useSitemapCheck();

  const normalizeUrl = (input: string): string => {
    if (!input) return '';
    let value = input.trim();
    if (!/^https?:\/\//i.test(value)) {
      value = `https://${value}`;
    }
    try {
      const urlObj = new URL(value);
      urlObj.hostname = urlObj.hostname.toLowerCase();
      return urlObj.toString();
    } catch {
      return '';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const normalized = normalizeUrl(inputUrl);
    if (!normalized || isLoading) return;
    startCheck(normalized);
  };

  const handleNewCheck = () => {
    reset();
  };

  const formattedElapsed = (elapsedMs / 1000).toFixed(1);
  const auditsToDisplay = pageAudits || resultData?.page_audits;

  return (
    <ToolInputWrapper
      title="Sitemap Inspector & Validator"
      desc="Deeply analyze, validate, and verify XML sitemaps, index structures, Core Web Vitals, and page-level SEO audits."
      onBack={onBack}
    >
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="tool-form-row">
          <input
            type="text"
            placeholder="example.com or https://example.com/sitemap.xml"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
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

          {isLoading ? (
            <button
              type="button"
              onClick={cancelCheck}
              style={{
                padding: '14px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Cancel Check
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputUrl.trim()}
              style={{
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: 'inherit',
                color: '#fff',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: '10px',
                cursor: !inputUrl.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap',
                opacity: !inputUrl.trim() ? 0.6 : 1,
              }}
            >
              Check Sitemap
            </button>
          )}
        </div>

        {inputUrl && normalizeUrl(inputUrl) !== inputUrl && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Target: </span>
            <code style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '2px 8px', borderRadius: '4px', color: 'var(--primary)' }}>
              {normalizeUrl(inputUrl)}
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

      {/* Progress / Queued / Polling State */}
      {isLoading && (
        <div
          style={{
            padding: '32px 24px',
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
            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '600' }}>
              {statusData?.status === 'queued' ? 'Check Queued' : 'Analyzing Sitemaps & Pages...'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
              {statusData?.progress?.message || (statusData?.progress?.phase ? `Phase: ${statusData.progress.phase}` : 'Discovering and validating sitemap entries...')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Status: <strong style={{ color: 'var(--primary)' }}>{statusData?.status || 'starting'}</strong></span>
            {statusData?.progress?.phase && <span>Phase: <strong>{statusData.progress.phase}</strong></span>}
            <span>Elapsed: <strong>{formattedElapsed}s</strong></span>
          </div>
        </div>
      )}

      {/* Completed Results View */}
      {stage === 'completed' && resultData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Actions bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Audit result for <strong style={{ color: 'var(--text)' }}>{resultData.domain || resultData.url}</strong>
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

          {/* Standard Page-Level Performance & SEO Audits View */}
          {auditsToDisplay && auditsToDisplay.length > 0 ? (
            <PageAuditResultView pageAudits={auditsToDisplay} />
          ) : (
            <>
              {/* Fallback to Standard Sitemap Structure View */}
              <SitemapSummaryCards result={resultData} />
              <SitemapTable sitemaps={resultData.sitemaps || []} />
              <SitemapFindingsList findings={resultData.findings || []} />
              <SitemapRecommendationsList recommendations={resultData.recommendations || []} />
            </>
          )}
        </div>
      )}
    </ToolInputWrapper>
  );
}
