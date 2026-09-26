import { useState, useCallback, useEffect, useRef } from 'react';
import { sitemapApi } from '../services/sitemapApi';
import type {
  SitemapCheckRequest,
  SitemapCheckResponse,
  SitemapStatusResponse,
  SitemapResultResponse,
  ApiError,
  ProgressPhase,
} from '../types/sitemap';

type Phase = 'idle' | 'submitting' | 'polling' | 'completed' | 'error';

interface UseSitemapCheckReturn {
  phase: Phase;
  error: string | null;
  checkId: string | null;
  taskId: string | null;
  statusResponse: SitemapStatusResponse | null;
  resultResponse: SitemapResultResponse | null;
  progress: { phase: ProgressPhase; message: string } | null;
  runCheck: (request: SitemapCheckRequest) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export function useSitemapCheck(): UseSitemapCheckReturn {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checkId, setCheckId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [statusResponse, setStatusResponse] = useState<SitemapStatusResponse | null>(null);
  const [resultResponse, setResultResponse] = useState<SitemapResultResponse | null>(null);
  const [progress, setProgress] = useState<{ phase: ProgressPhase; message: string } | null>(null);

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (currentCheckId?: string) => {
    const cid = currentCheckId || checkId;
    if (!cid || !isMountedRef.current) return;

    try {
      const data = await sitemapApi.getStatus(cid);
      
      if (!isMountedRef.current) return;
      
      setStatusResponse(data);
      setProgress(data.progress);

      if (data.status === 'completed') {
        stopPolling();
        setPhase('completed');
        await fetchResult(data.check_id);
      } else if (data.status === 'failed') {
        stopPolling();
        setPhase('error');
        setError(data.error || 'Sitemap check failed');
      }
      // Continue polling for 'queued' or 'processing'
    } catch (err) {
      if (!isMountedRef.current) return;
      stopPolling();
      setPhase('error');
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to poll status');
    }
  }, [checkId, stopPolling]);

  const fetchResult = useCallback(async (checkId: string) => {
    try {
      const data = await sitemapApi.getResult(checkId);
      if (!isMountedRef.current) return;
      setResultResponse(data);
    } catch (err) {
      if (!isMountedRef.current) return;
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to fetch results');
    }
  }, []);

  const runCheck = useCallback(async (request: SitemapCheckRequest) => {
    setPhase('submitting');
    setError(null);
    setCheckId(null);
    setTaskId(null);
    setStatusResponse(null);
    setResultResponse(null);
    setProgress(null);
    stopPolling();

    try {
      const data: SitemapCheckResponse = await sitemapApi.check(request);
      
      if (!isMountedRef.current) return;
      
      const newCheckId = data.check_id;
      setCheckId(newCheckId);
      setTaskId(data.task_id);
      setPhase('polling');

      // Start polling - pass checkId directly to avoid closure issue
      pollingIntervalRef.current = setInterval(() => pollStatus(newCheckId), 2500);
      pollStatus(newCheckId); // Initial poll
    } catch (err) {
      if (!isMountedRef.current) return;
      setPhase('error');
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to start sitemap check');
    }
  }, [pollStatus, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setPhase('idle');
    setError(null);
    setCheckId(null);
    setTaskId(null);
    setStatusResponse(null);
    setResultResponse(null);
    setProgress(null);
  }, [stopPolling]);

  return {
    phase,
    error,
    checkId,
    taskId,
    statusResponse,
    resultResponse,
    progress,
    runCheck,
    clearError,
    reset,
  };
}