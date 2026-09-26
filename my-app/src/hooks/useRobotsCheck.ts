import { useState, useCallback, useEffect, useRef } from 'react';
import type { RobotsCheckResponse } from '../types/robots';
import { checkRobotsTxt, RobotsApiError } from '../services/robotsApi';

export function extractBareDomain(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();
  // Remove protocol if present
  cleaned = cleaned.replace(/^[a-zA-Z]+:\/\//, '');
  // Remove port or path/query
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split('?')[0];
  cleaned = cleaned.split('#')[0];
  cleaned = cleaned.split(':')[0];
  return cleaned.toLowerCase();
}

export interface UseRobotsCheckReturn {
  isLoading: boolean;
  result: RobotsCheckResponse | null;
  error: string | null;
  checkedDomain: string;
  startCheck: (rawDomain: string) => Promise<void>;
  reset: () => void;
}

export function useRobotsCheck(): UseRobotsCheckReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RobotsCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedDomain, setCheckedDomain] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsLoading(false);
      setResult(null);
      setError(null);
      setCheckedDomain('');
    }
  }, []);

  const startCheck = useCallback(async (rawDomain: string) => {
    const bareDomain = extractBareDomain(rawDomain);
    if (!bareDomain) {
      setError('Please enter a valid domain name (e.g., example.com).');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCheckedDomain(bareDomain);

    try {
      const response = await checkRobotsTxt(
        { domain: bareDomain },
        abortControllerRef.current.signal
      );

      if (!isMountedRef.current) return;
      setResult(response);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const msg =
        err instanceof RobotsApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to complete robots.txt check.';
      setError(msg);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    isLoading,
    result,
    error,
    checkedDomain,
    startCheck,
    reset,
  };
}
