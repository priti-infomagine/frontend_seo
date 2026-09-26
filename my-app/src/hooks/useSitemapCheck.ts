import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  SitemapStage,
  SitemapStatusResponse,
  SitemapResultResponse,
  PageAuditResult,
  OverallStatus,
  SeverityLevel,
} from '../types/sitemap';
import {
  startSitemapCheck,
  getSitemapStatus,
  getSitemapResult,
  SitemapApiError,
} from '../services/sitemapApi';

const POLL_INTERVAL_MS = 2500;
const MAX_CONSECUTIVE_POLL_ERRORS = 3;

/**
 * Normalize raw response whether it's:
 * 1. Array of PageAuditResult: `[ { id, url, device, performance_score, seo_score, ... } ]`
 * 2. Object with `page_audits`, `results`, `data`, or standard `SitemapResultResponse`
 */
export function normalizeSitemapResult(raw: unknown): SitemapResultResponse {
  // If array directly
  if (Array.isArray(raw)) {
    const pageAudits = raw as PageAuditResult[];
    return convertPageAuditsToResultResponse(pageAudits);
  }

  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;

    // Check if page_audits, results, or data is an array of page audits
    const candidates = [obj.page_audits, obj.results, obj.data, obj.pages];
    for (const cand of candidates) {
      if (Array.isArray(cand) && cand.length > 0 && typeof cand[0] === 'object' && cand[0] !== null) {
        const first = cand[0] as Record<string, unknown>;
        if ('performance_score' in first || 'seo_score' in first || 'fcp_ms' in first || 'device' in first) {
          const converted = convertPageAuditsToResultResponse(cand as PageAuditResult[]);
          return {
            ...converted,
            ...obj,
            page_audits: cand as PageAuditResult[],
          };
        }
      }
    }

    return obj as unknown as SitemapResultResponse;
  }

  return {
    sitemaps: [],
    findings: [],
    recommendations: [],
    overall_status: 'not_applicable',
    severity: 'none',
    summary: {
      total_sitemaps: 0,
      sitemap_indexes: 0,
      url_sitemaps: 0,
      total_urls_declared: 0,
      total_issues: 0,
    },
  };
}

function convertPageAuditsToResultResponse(pageAudits: PageAuditResult[]): SitemapResultResponse {
  let totalIssues = 0;
  let totalScore = 0;
  let scoreCount = 0;

  for (const page of pageAudits) {
    if (page.performance_score !== undefined && page.performance_score !== null) {
      totalScore += page.performance_score;
      scoreCount++;
    }
    if (page.recommendations) {
      for (const rec of page.recommendations) {
        if (rec.score !== null && rec.score !== undefined && rec.score < 90) {
          totalIssues++;
        } else if (rec.score_display_mode === 'error') {
          totalIssues++;
        }
      }
    }
  }

  const avgScore = scoreCount > 0 ? totalScore / scoreCount : 100;
  const overall_status: OverallStatus = avgScore >= 90 ? 'pass' : avgScore >= 50 ? 'warning' : 'fail';
  const severity: SeverityLevel = avgScore >= 90 ? 'none' : avgScore >= 70 ? 'low' : avgScore >= 50 ? 'medium' : 'high';

  const firstUrl = pageAudits[0]?.url || '';
  let domain = '';
  try {
    domain = new URL(firstUrl).hostname;
  } catch {
    domain = firstUrl;
  }

  return {
    check_id: pageAudits[0]?.id || 'audit-result',
    url: firstUrl,
    domain,
    status: 'completed',
    checked_at: new Date().toISOString(),
    overall_status,
    severity,
    summary: {
      total_sitemaps: pageAudits.length,
      sitemap_indexes: 0,
      url_sitemaps: pageAudits.length,
      total_urls_declared: pageAudits.length,
      total_issues: totalIssues,
    },
    sitemaps: pageAudits.map((p) => ({
      url: p.url,
      is_index: false,
      status_code: p.status === 'success' ? 200 : 500,
      entry_count: 1,
      response_time_ms: p.fcp_ms || 0,
      error: p.reason || null,
      issues: (p.recommendations || []).filter((r) => r.score !== null && r.score !== undefined && r.score < 90).map((r) => ({
        id: r.audit_id,
        message: r.title,
        severity: r.score === 0 ? 'high' : 'medium',
        description: r.description,
      })),
      recommendations: (p.recommendations || []).map((r) => ({
        id: r.audit_id,
        title: r.title,
        description: r.description,
        action: r.recommendation || undefined,
      })),
    })),
    findings: [],
    recommendations: [],
    page_audits: pageAudits,
  };
}

export interface UseSitemapCheckReturn {
  stage: SitemapStage;
  checkId: string | null;
  targetUrl: string;
  statusData: SitemapStatusResponse | null;
  resultData: SitemapResultResponse | null;
  pageAudits: PageAuditResult[] | null;
  error: string | null;
  elapsedMs: number;
  isLoading: boolean;
  startCheck: (rawUrl: string) => Promise<void>;
  cancelCheck: () => void;
  reset: () => void;
}

export function useSitemapCheck(): UseSitemapCheckReturn {
  const [stage, setStage] = useState<SitemapStage>('idle');
  const [checkId, setCheckId] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [statusData, setStatusData] = useState<SitemapStatusResponse | null>(null);
  const [resultData, setResultData] = useState<SitemapResultResponse | null>(null);
  const [pageAudits, setPageAudits] = useState<PageAuditResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const isPollingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const consecutiveErrorsRef = useRef<number>(0);

  // Track component mounted state & cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Elapsed timer when starting / polling
  useEffect(() => {
    if (stage !== 'starting' && stage !== 'polling') return;
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedMs(Date.now() - startTimeRef.current);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [stage]);

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cancelCheck = useCallback(() => {
    stopPolling();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (isMountedRef.current) {
      setStage('idle');
      setError('Check was cancelled.');
    }
  }, [stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (isMountedRef.current) {
      setStage('idle');
      setCheckId(null);
      setTargetUrl('');
      setStatusData(null);
      setResultData(null);
      setPageAudits(null);
      setError(null);
      setElapsedMs(0);
      startTimeRef.current = null;
      consecutiveErrorsRef.current = 0;
    }
  }, [stopPolling]);

  const pollStatus = useCallback(
    async (id: string) => {
      if (!isMountedRef.current || !isPollingRef.current) return;

      try {
        const status = await getSitemapStatus(id);

        if (!isMountedRef.current || !isPollingRef.current) return;

        setStatusData(status);
        consecutiveErrorsRef.current = 0;

        if (status.status === 'completed') {
          stopPolling();
          setStage('polling'); // briefly before result fetch

          try {
            const rawResult = await getSitemapResult(id);
            if (!isMountedRef.current) return;

            const normalized = normalizeSitemapResult(rawResult);
            setResultData(normalized);
            setPageAudits(normalized.page_audits || (Array.isArray(rawResult) ? (rawResult as PageAuditResult[]) : null));
            setStage('completed');
          } catch (resErr) {
            if (!isMountedRef.current) return;
            const msg =
              resErr instanceof SitemapApiError
                ? resErr.message
                : resErr instanceof Error
                ? resErr.message
                : 'Failed to retrieve final sitemap result';
            setError(msg);
            setStage('failed');
          }
          return;
        }

        if (status.status === 'failed') {
          stopPolling();
          setStage('failed');
          setError(status.error || 'Sitemap check failed during processing.');
          return;
        }

        // Continue polling if queued or processing
        if (status.status === 'queued' || status.status === 'processing') {
          timeoutRef.current = window.setTimeout(() => {
            pollStatus(id);
          }, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!isMountedRef.current || !isPollingRef.current) return;

        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_POLL_ERRORS) {
          stopPolling();
          setStage('failed');
          const msg =
            err instanceof SitemapApiError
              ? err.message
              : err instanceof Error
              ? err.message
              : 'Error while polling sitemap status.';
          setError(msg);
        } else {
          timeoutRef.current = window.setTimeout(() => {
            pollStatus(id);
          }, POLL_INTERVAL_MS);
        }
      }
    },
    [stopPolling]
  );

  const startCheck = useCallback(
    async (rawUrl: string) => {
      const trimmed = rawUrl.trim();
      if (!trimmed) {
        setError('Please enter a valid website URL.');
        return;
      }

      if (isPollingRef.current || stage === 'starting') {
        return;
      }

      stopPolling();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setStage('starting');
      setError(null);
      setStatusData(null);
      setResultData(null);
      setPageAudits(null);
      setTargetUrl(trimmed);
      setElapsedMs(0);
      startTimeRef.current = Date.now();
      consecutiveErrorsRef.current = 0;

      try {
        const resp = await startSitemapCheck(
          { url: trimmed },
          abortControllerRef.current.signal
        );

        if (!isMountedRef.current) return;

        const newCheckId = resp.check_id;
        setCheckId(newCheckId);
        setStage('polling');
        isPollingRef.current = true;

        setStatusData({
          check_id: newCheckId,
          url: resp.url || trimmed,
          domain: resp.domain,
          status: 'queued',
          progress: {
            phase: 'queued',
            message: 'Check request queued in system...',
          },
        });

        timeoutRef.current = window.setTimeout(() => {
          pollStatus(newCheckId);
        }, POLL_INTERVAL_MS);
      } catch (err) {
        if (!isMountedRef.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setStage('failed');
        const msg =
          err instanceof SitemapApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to initiate sitemap check.';
        setError(msg);
      }
    },
    [stage, stopPolling, pollStatus]
  );

  const isLoading = stage === 'starting' || stage === 'polling';

  return {
    stage,
    checkId,
    targetUrl,
    statusData,
    resultData,
    pageAudits,
    error,
    elapsedMs,
    isLoading,
    startCheck,
    cancelCheck,
    reset,
  };
}
