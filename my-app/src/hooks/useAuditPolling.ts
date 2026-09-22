import { useState, useCallback, useEffect, useRef } from 'react';
import type { StartAuditRequest, StartAuditResponse, AuditStatusResponse, NormalizedAuditResult } from '../types/audit';
import { normalizeAuditResult, NormalizationError } from '../utils/normalizeAuditResult';

const POLL_INTERVAL = 2500;
const MAX_RETRIES = 3;
const CLIENT_TIMEOUT = 10 * 60 * 1000;

type AuditStage = 'idle' | 'starting' | 'polling' | 'completed' | 'failed';

interface UseAuditPollingReturn {
  stage: AuditStage;
  auditId: string | null;
  statusData: AuditStatusResponse | null;
  resultData: NormalizedAuditResult | null;
  error: string | null;
  elapsed: number;
  retryCount: number;
  startAudit: (request: StartAuditRequest) => Promise<void>;
  cancelAudit: () => void;
  reset: () => void;
}

export function useAuditPolling(): UseAuditPollingReturn {
  const [stage, setStage] = useState<AuditStage>('idle');
  const [auditId, setAuditId] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<AuditStatusResponse | null>(null);
  const [resultData, setResultData] = useState<NormalizedAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const pollingActiveRef = useRef(false);
  const auditIdRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (stage !== 'polling' || !startedAt) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(startedAt).getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, startedAt]);

  const stopPolling = useCallback(() => {
    pollingActiveRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    const currentAuditId = auditIdRef.current;
    if (!currentAuditId || !isMountedRef.current || !pollingActiveRef.current) return;

    try {
      const res = await fetch(`/api/v1/audit/status/${currentAuditId}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json() as AuditStatusResponse;

      if (!isMountedRef.current || !pollingActiveRef.current) return;

      setStatusData(data);
      setRetryCount(0);

      // Log actual status values for debugging
      console.debug('[useAuditPolling] Status:', {
        parse_status: data.parse_status,
        evaluate_status: data.evaluate_status,
        score_status: data.score_status,
      });

      // Normalize status values to lowercase for robust comparison
      const normalize = (s: string | undefined) => (s || '').toLowerCase().trim();
      const parseStatus = normalize(data.parse_status);
      const evaluateStatus = normalize(data.evaluate_status);
      const scoreStatus = normalize(data.score_status);

      const parseComplete = parseStatus === 'completed';
      const evaluateComplete = evaluateStatus === 'completed';
      const scoreComplete = scoreStatus === 'completed';

      const anyFailed = 
        parseStatus === 'failed' || parseStatus === 'error' ||
        evaluateStatus === 'failed' || evaluateStatus === 'error' ||
        scoreStatus === 'failed' || scoreStatus === 'error';

      if (anyFailed) {
        stopPolling();
        if (isMountedRef.current) {
          setError('Audit failed during processing');
          setStage('failed');
        }
        return;
      }

      if (parseComplete && evaluateComplete && scoreComplete) {
        stopPolling();
        // Fetch final result exactly once
        try {
          const resultRes = await fetch(`/api/v1/audit/result/${currentAuditId}`);
          if (!resultRes.ok) {
            throw new Error(`HTTP ${resultRes.status}`);
          }
          const rawResult = await resultRes.json();
          if (isMountedRef.current) {
            try {
              const normalizedResult = normalizeAuditResult(rawResult);
              setResultData(normalizedResult);
              setStage('completed');
            } catch (normErr) {
              console.error('[useAuditPolling] Failed to normalize audit result:', normErr instanceof NormalizationError ? normErr.message : normErr);
              setError('Unable to process audit results. Please try again.');
              setStage('failed');
            }
          }
        } catch (err) {
          if (isMountedRef.current) {
            setError(err instanceof Error ? err.message : 'Failed to fetch results');
            setStage('failed');
          }
        }
        return;
      }

      // Still in progress - schedule next poll
      timeoutRef.current = window.setTimeout(fetchStatus, POLL_INTERVAL);
    } catch (err) {
      if (!isMountedRef.current || !pollingActiveRef.current) return;

      const error = err instanceof Error ? err.message : 'Network error';
      if (retryCount < MAX_RETRIES) {
        setRetryCount((c) => c + 1);
        timeoutRef.current = window.setTimeout(fetchStatus, Math.min(1000 * 2 ** retryCount, 10000));
      } else {
        stopPolling();
        if (isMountedRef.current) {
          setError(`Polling failed after ${MAX_RETRIES} retries: ${error}`);
          setStage('failed');
        }
      }
    }
  }, [retryCount, stopPolling]);

  const startAudit = useCallback(async (request: StartAuditRequest) => {
    setError(null);
    setResultData(null);
    setStatusData(null);
    setRetryCount(0);
    setElapsed(0);
    setStage('starting');

    try {
      const res = await fetch('/api/v1/audit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json() as StartAuditResponse;

      if (!data.audit_id) {
        throw new Error('No audit_id returned from server');
      }

      const newAuditId = data.audit_id;
      setAuditId(newAuditId);
      auditIdRef.current = newAuditId; // Use ref to avoid stale closure
      setStartedAt(new Date().toISOString());
      setStage('polling');
      pollingActiveRef.current = true;

      // Client-side timeout
      timeoutRef.current = window.setTimeout(() => {
        if (pollingActiveRef.current) {
          stopPolling();
          if (isMountedRef.current) {
            setError('Audit is taking longer than expected. Please try again or check back later.');
            setStage('failed');
          }
        }
      }, CLIENT_TIMEOUT);

      // Initial fetch - use the auditId directly, not from state
      fetchStatus();
    } catch (err) {
      pollingActiveRef.current = false;
      setError(err instanceof Error ? err.message : 'Failed to start audit');
      setStage('failed');
    }
  }, [fetchStatus, stopPolling]);

  const cancelAudit = useCallback(() => {
    stopPolling();
    setAuditId(null);
    auditIdRef.current = null;
    setStatusData(null);
    setStage('idle');
    setError(null);
  }, [stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setStage('idle');
    setAuditId(null);
    auditIdRef.current = null;
    setStatusData(null);
    setResultData(null);
    setError(null);
    setElapsed(0);
    setRetryCount(0);
    setStartedAt(null);
  }, [stopPolling]);

  return {
    stage,
    auditId,
    statusData,
    resultData,
    error,
    elapsed,
    retryCount,
    startAudit,
    cancelAudit,
    reset,
  };
}